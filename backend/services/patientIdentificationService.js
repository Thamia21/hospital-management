const PatientRegistry = require('../models/PatientRegistry');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Patient Identification Service
 * Handles secure patient identification across multiple hospitals
 */
class PatientIdentificationService {
  
  /**
   * Register or identify a patient across hospitals
   * @param {Object} patientData - Patient information
   * @param {String} facilityId - Current facility ID
   * @returns {Object} Patient registry entry with UUID
   */
  async registerOrIdentifyPatient(patientData, facilityId) {
    try {
      const { idNumber, firstName, lastName, dateOfBirth, email, phone } = patientData;
      
      // Hash the SA ID number for privacy
      const nationalIdHash = this.hashNationalId(idNumber);
      
      // Check if patient already exists in registry
      let patientRegistry = await PatientRegistry.findOne({ nationalIdHash });
      
      if (patientRegistry) {
        // Patient exists - add new hospital registration if not already registered
        const isRegistered = patientRegistry.registeredHospitals.some(
          reg => reg.facilityId.toString() === facilityId.toString()
        );
        
        if (!isRegistered) {
          const facility = await this.getFacilityInfo(facilityId);
          patientRegistry.addHospitalRegistration(
            facilityId,
            facility.code,
            facility.name,
            patientData.localPatientId
          );
          
          patientRegistry.logAccess(
            'updated',
            facilityId,
            patientData.registeredBy,
            patientData.ipAddress,
            'Added new hospital registration'
          );
          
          await patientRegistry.save();
        }
        
        return {
          patientUUID: patientRegistry.patientUUID,
          isNewPatient: false,
          registry: patientRegistry
        };
      }
      
      // New patient - create registry entry
      const facility = await this.getFacilityInfo(facilityId);
      const patientUUID = PatientRegistry.generatePatientUUID(idNumber, facility.code);
      
      patientRegistry = new PatientRegistry({
        patientUUID,
        nationalIdHash,
        firstName,
        lastName,
        dateOfBirth,
        gender: patientData.gender,
        phone,
        email,
        registeredHospitals: [{
          facilityId,
          facilityCode: facility.code,
          facilityName: facility.name,
          localPatientId: patientData.localPatientId,
          registrationDate: new Date(),
          status: 'active',
          lastVisit: new Date()
        }]
      });
      
      patientRegistry.logAccess(
        'created',
        facilityId,
        patientData.registeredBy,
        patientData.ipAddress,
        'Initial patient registration'
      );
      
      await patientRegistry.save();
      
      return {
        patientUUID,
        isNewPatient: true,
        registry: patientRegistry
      };
      
    } catch (error) {
      console.error('Error in registerOrIdentifyPatient:', error);
      throw new Error(`Patient identification failed: ${error.message}`);
    }
  }
  
  /**
   * Find patient by SA ID number
   * @param {String} idNumber - SA ID number
   * @returns {Object} Patient registry entry or null
   */
  async findPatientByIdNumber(idNumber) {
    try {
      const nationalIdHash = this.hashNationalId(idNumber);
      return await PatientRegistry.findOne({ nationalIdHash })
        .populate('registeredHospitals.facilityId');
    } catch (error) {
      console.error('Error finding patient by ID:', error);
      return null;
    }
  }
  
  /**
   * Find patient by UUID
   * @param {String} patientUUID - Universal patient identifier
   * @returns {Object} Patient registry entry or null
   */
  async findPatientByUUID(patientUUID) {
    try {
      return await PatientRegistry.findOne({ patientUUID })
        .populate('registeredHospitals.facilityId');
    } catch (error) {
      console.error('Error finding patient by UUID:', error);
      return null;
    }
  }
  
  /**
   * Fuzzy match patient by demographics (fallback for patients without ID)
   * @param {Object} demographics - Patient demographic information
   * @returns {Array} Array of potential matches with confidence scores
   */
  async fuzzyMatchPatient(demographics) {
    try {
      const { firstName, lastName, dateOfBirth, phone } = demographics;
      
      // Find candidates with similar names and DOB
      const candidates = await PatientRegistry.find({
        firstName: new RegExp(firstName, 'i'),
        lastName: new RegExp(lastName, 'i'),
        dateOfBirth: {
          $gte: new Date(new Date(dateOfBirth).setDate(new Date(dateOfBirth).getDate() - 1)),
          $lte: new Date(new Date(dateOfBirth).setDate(new Date(dateOfBirth).getDate() + 1))
        }
      });
      
      // Calculate confidence scores
      const matches = candidates.map(candidate => {
        let score = 0;
        
        // Name matching (case-insensitive)
        if (candidate.firstName.toLowerCase() === firstName.toLowerCase()) score += 30;
        if (candidate.lastName.toLowerCase() === lastName.toLowerCase()) score += 30;
        
        // DOB exact match
        if (candidate.dateOfBirth.toDateString() === new Date(dateOfBirth).toDateString()) {
          score += 30;
        }
        
        // Phone number match
        if (phone && candidate.phone === phone) score += 10;
        
        return {
          patient: candidate,
          confidenceScore: score,
          matchQuality: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
        };
      });
      
      // Sort by confidence score
      return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
      
    } catch (error) {
      console.error('Error in fuzzy match:', error);
      return [];
    }
  }
  
  /**
   * Get all hospitals where patient is registered
   * @param {String} patientUUID - Universal patient identifier
   * @returns {Array} Array of facility registrations
   */
  async getPatientHospitals(patientUUID) {
    try {
      const registry = await PatientRegistry.findOne({ patientUUID })
        .populate('registeredHospitals.facilityId');
      
      if (!registry) {
        return [];
      }
      
      return registry.registeredHospitals.filter(reg => reg.status === 'active');
    } catch (error) {
      console.error('Error getting patient hospitals:', error);
      return [];
    }
  }
  
  /**
   * Update patient visit at facility
   * @param {String} patientUUID - Universal patient identifier
   * @param {String} facilityId - Facility ID
   */
  async updatePatientVisit(patientUUID, facilityId) {
    try {
      const registry = await PatientRegistry.findOne({ patientUUID });
      
      if (!registry) {
        throw new Error('Patient not found in registry');
      }
      
      const hospitalReg = registry.registeredHospitals.find(
        reg => reg.facilityId.toString() === facilityId.toString()
      );
      
      if (hospitalReg) {
        hospitalReg.lastVisit = new Date();
        hospitalReg.status = 'active';
        await registry.save();
      }
      
      return registry;
    } catch (error) {
      console.error('Error updating patient visit:', error);
      throw error;
    }
  }
  
  /**
   * Transfer patient to new facility
   * @param {String} patientUUID - Universal patient identifier
   * @param {String} fromFacilityId - Source facility ID
   * @param {String} toFacilityId - Destination facility ID
   */
  async transferPatient(patientUUID, fromFacilityId, toFacilityId) {
    try {
      const registry = await PatientRegistry.findOne({ patientUUID });
      
      if (!registry) {
        throw new Error('Patient not found in registry');
      }
      
      // Update source facility status
      const sourceReg = registry.registeredHospitals.find(
        reg => reg.facilityId.toString() === fromFacilityId.toString()
      );
      if (sourceReg) {
        sourceReg.status = 'transferred';
      }
      
      // Add or activate destination facility
      const destReg = registry.registeredHospitals.find(
        reg => reg.facilityId.toString() === toFacilityId.toString()
      );
      
      if (destReg) {
        destReg.status = 'active';
        destReg.lastVisit = new Date();
      } else {
        const facility = await this.getFacilityInfo(toFacilityId);
        registry.addHospitalRegistration(
          toFacilityId,
          facility.code,
          facility.name,
          null
        );
      }
      
      registry.logAccess(
        'updated',
        toFacilityId,
        null,
        null,
        `Patient transferred from ${fromFacilityId} to ${toFacilityId}`
      );
      
      await registry.save();
      return registry;
      
    } catch (error) {
      console.error('Error transferring patient:', error);
      throw error;
    }
  }
  
  /**
   * Hash SA ID number for privacy
   * @param {String} idNumber - SA ID number
   * @returns {String} Hashed ID
   */
  hashNationalId(idNumber) {
    const salt = process.env.ID_HASH_SALT || 'default-salt-change-in-production';
    return crypto
      .createHmac('sha256', salt)
      .update(idNumber)
      .digest('hex');
  }
  
  /**
   * Get facility information
   * @param {String} facilityId - Facility ID
   * @returns {Object} Facility information
   */
  async getFacilityInfo(facilityId) {
    const Facility = require('../models/Facility');
    const facility = await Facility.findById(facilityId);
    
    if (!facility) {
      throw new Error('Facility not found');
    }
    
    return {
      id: facility._id,
      name: facility.name,
      code: facility.code || 'UNKNOWN',
      province: facility.province
    };
  }
  
  /**
   * Verify patient identity for cross-hospital access
   * @param {String} patientUUID - Universal patient identifier
   * @param {Object} verificationData - Data to verify against
   * @returns {Boolean} Verification result
   */
  async verifyPatientIdentity(patientUUID, verificationData) {
    try {
      const registry = await PatientRegistry.findOne({ patientUUID });
      
      if (!registry) {
        return false;
      }
      
      // Verify demographics match
      const nameMatch = 
        registry.firstName.toLowerCase() === verificationData.firstName.toLowerCase() &&
        registry.lastName.toLowerCase() === verificationData.lastName.toLowerCase();
      
      const dobMatch = 
        registry.dateOfBirth.toDateString() === new Date(verificationData.dateOfBirth).toDateString();
      
      return nameMatch && dobMatch;
      
    } catch (error) {
      console.error('Error verifying patient identity:', error);
      return false;
    }
  }
}

module.exports = new PatientIdentificationService();
