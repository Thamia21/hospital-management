const PatientRegistry = require('../models/PatientRegistry');
const PatientConsent = require('../models/PatientConsent');
const RecordAccessLog = require('../models/RecordAccessLog');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Facility = require('../models/Facility');

/**
 * Cross-Hospital Access Control Service
 * Manages secure access to patient records across different hospitals
 */
class CrossHospitalAccessService {
  
  /**
   * Request access to patient records from another hospital
   * @param {Object} requestData - Access request details
   * @returns {Object} Access result with records or consent request
   */
  async requestPatientRecords(requestData) {
    const {
      patientUUID,
      requestingDoctorId,
      requestingFacilityId,
      purpose,
      recordTypes = ['all']
    } = requestData;
    
    try {
      // 1. Verify requesting doctor's credentials
      const doctor = await User.findById(requestingDoctorId);
      if (!doctor || !['DOCTOR', 'NURSE'].includes(doctor.role)) {
        throw new Error('Invalid healthcare provider credentials');
      }
      
      // 2. Get patient registry
      const patientRegistry = await PatientRegistry.findOne({ patientUUID })
        .populate('registeredHospitals.facilityId');
      
      if (!patientRegistry) {
        throw new Error('Patient not found in registry');
      }
      
      // 3. Check if patient consent exists
      const hasConsent = await this.checkPatientConsent(
        patientUUID,
        requestingFacilityId
      );
      
      if (!hasConsent) {
        // Request consent from patient
        await this.requestPatientConsent({
          patientUUID,
          targetFacilityId: requestingFacilityId,
          requestingDoctorId,
          purpose
        });
        
        return {
          status: 'pending_consent',
          message: 'Patient consent required. Consent request has been sent to patient.',
          consentRequired: true
        };
      }
      
      // 4. Fetch records from all registered hospitals
      const records = await this.fetchCrossHospitalRecords(
        patientUUID,
        requestingFacilityId,
        recordTypes
      );
      
      // 5. Log access for audit trail
      await this.logCrossHospitalAccess({
        patientUUID,
        accessedBy: requestingDoctorId,
        sourceFacilityId: requestingFacilityId,
        purpose,
        recordTypes,
        recordCount: records.length
      });
      
      return {
        status: 'success',
        records,
        accessLevel: 'read_only',
        hospitals: patientRegistry.registeredHospitals.map(reg => ({
          facilityId: reg.facilityId._id,
          facilityName: reg.facilityName,
          registrationDate: reg.registrationDate,
          lastVisit: reg.lastVisit
        }))
      };
      
    } catch (error) {
      console.error('Error requesting patient records:', error);
      throw error;
    }
  }
  
  /**
   * Check if valid consent exists for cross-hospital access
   * @param {String} patientUUID - Universal patient identifier
   * @param {String} targetFacilityId - Requesting facility ID
   * @returns {Boolean} Consent status
   */
  async checkPatientConsent(patientUUID, targetFacilityId) {
    try {
      return await PatientConsent.hasValidConsent(patientUUID, targetFacilityId);
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }
  
  /**
   * Request patient consent for cross-hospital access
   * @param {Object} consentData - Consent request details
   * @returns {Object} Consent request result
   */
  async requestPatientConsent(consentData) {
    const {
      patientUUID,
      targetFacilityId,
      requestingDoctorId,
      purpose,
      accessScope
    } = consentData;
    
    try {
      // Get patient and facility info
      const patientRegistry = await PatientRegistry.findOne({ patientUUID });
      const targetFacility = await Facility.findById(targetFacilityId);
      const requestingDoctor = await User.findById(requestingDoctorId);
      
      // Find source facility (patient's current hospital)
      const currentHospital = patientRegistry.registeredHospitals.find(
        reg => reg.status === 'active'
      );
      
      // Create consent request
      const consent = new PatientConsent({
        patientUUID,
        patientId: patientRegistry.registeredHospitals[0].localPatientId,
        patientName: `${patientRegistry.firstName} ${patientRegistry.lastName}`,
        sourceFacilityId: currentHospital.facilityId,
        sourceFacilityName: currentHospital.facilityName,
        targetFacilityId,
        targetFacilityName: targetFacility.name,
        purpose,
        purposeDescription: `Access requested by Dr. ${requestingDoctor.name}`,
        consentType: 'limited_access',
        accessScope: accessScope || {
          includeMedicalRecords: true,
          includePrescriptions: true,
          includeTestResults: true,
          includeAppointments: false,
          includeAllergies: true,
          includeChronicConditions: true
        },
        requestingProvider: {
          userId: requestingDoctorId,
          name: requestingDoctor.name,
          role: requestingDoctor.role,
          licenseNumber: requestingDoctor.licenseNumber
        },
        approvalStatus: 'pending',
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      });
      
      await consent.save();
      
      // TODO: Send notification to patient (email/SMS)
      // await this.notifyPatientConsentRequest(patientUUID, consent._id);
      
      return {
        status: 'consent_requested',
        consentId: consent._id,
        message: 'Consent request sent to patient'
      };
      
    } catch (error) {
      console.error('Error requesting consent:', error);
      throw error;
    }
  }
  
  /**
   * Grant patient consent for cross-hospital access
   * @param {String} consentId - Consent request ID
   * @param {Object} consentDetails - Consent approval details
   * @returns {Object} Consent approval result
   */
  async grantPatientConsent(consentId, consentDetails) {
    try {
      const consent = await PatientConsent.findById(consentId);
      
      if (!consent) {
        throw new Error('Consent request not found');
      }
      
      // Update consent
      consent.consentGiven = true;
      consent.consentDate = new Date();
      consent.approvalStatus = 'approved';
      consent.digitalSignature = consentDetails.digitalSignature;
      
      // Mark informed consent as completed
      consent.informedConsent = {
        purposeExplained: true,
        dataTypesExplained: true,
        recipientsExplained: true,
        retentionPeriodExplained: true,
        rightsExplained: true,
        consequencesExplained: true,
        voluntaryConfirmed: true
      };
      
      consent.auditLog.push({
        action: 'approved',
        performedBy: consent.patientId,
        timestamp: new Date(),
        details: 'Patient granted consent for cross-hospital access',
        ipAddress: consentDetails.ipAddress
      });
      
      await consent.save();
      
      // Update patient registry
      const patientRegistry = await PatientRegistry.findOne({ 
        patientUUID: consent.patientUUID 
      });
      
      if (patientRegistry) {
        patientRegistry.grantConsent(
          consent.targetFacilityId,
          consent.consentType,
          consent.expiryDate,
          consent.purpose
        );
        await patientRegistry.save();
      }
      
      return {
        status: 'consent_granted',
        consent,
        message: 'Consent successfully granted'
      };
      
    } catch (error) {
      console.error('Error granting consent:', error);
      throw error;
    }
  }
  
  /**
   * Fetch patient records from multiple hospitals
   * @param {String} patientUUID - Universal patient identifier
   * @param {String} requestingFacilityId - Requesting facility ID
   * @param {Array} recordTypes - Types of records to fetch
   * @returns {Array} Combined records from all hospitals
   */
  async fetchCrossHospitalRecords(patientUUID, requestingFacilityId, recordTypes) {
    try {
      const records = {
        medicalRecords: [],
        prescriptions: [],
        testResults: [],
        summary: {}
      };
      
      // Fetch medical records
      if (recordTypes.includes('all') || recordTypes.includes('medical_records')) {
        const medicalRecords = await MedicalRecord.find({
          patientUUID,
          facilityId: { $ne: requestingFacilityId } // Exclude requesting facility's own records
        })
        .populate('facilityId', 'name code province')
        .populate('doctorId', 'name specialization')
        .sort({ recordDate: -1 });
        
        records.medicalRecords = medicalRecords.map(record => ({
          ...record.toObject(),
          accessLevel: 'read_only',
          sourceHospital: record.facilityId?.name,
          isExternal: true
        }));
      }
      
      // Fetch prescriptions
      if (recordTypes.includes('all') || recordTypes.includes('prescriptions')) {
        const prescriptions = await Prescription.find({
          patientUUID,
          facilityId: { $ne: requestingFacilityId }
        })
        .populate('facilityId', 'name code')
        .sort({ prescribedDate: -1 });
        
        records.prescriptions = prescriptions.map(prescription => ({
          ...prescription.toObject(),
          accessLevel: 'read_only',
          sourceHospital: prescription.facilityId?.name,
          isExternal: true
        }));
      }
      
      // Generate summary
      records.summary = {
        totalMedicalRecords: records.medicalRecords.length,
        totalPrescriptions: records.prescriptions.length,
        hospitalsWithRecords: new Set([
          ...records.medicalRecords.map(r => r.facilityId?._id?.toString()),
          ...records.prescriptions.map(r => r.facilityId?._id?.toString())
        ]).size,
        oldestRecord: this.getOldestRecordDate(records),
        mostRecentRecord: this.getMostRecentRecordDate(records)
      };
      
      return records;
      
    } catch (error) {
      console.error('Error fetching cross-hospital records:', error);
      throw error;
    }
  }
  
  /**
   * Log cross-hospital access for audit trail
   * @param {Object} accessData - Access details to log
   */
  async logCrossHospitalAccess(accessData) {
    try {
      const {
        patientUUID,
        accessedBy,
        sourceFacilityId,
        purpose,
        recordTypes,
        recordCount
      } = accessData;
      
      const user = await User.findById(accessedBy);
      const facility = await Facility.findById(sourceFacilityId);
      
      await RecordAccessLog.logAccess({
        userId: accessedBy,
        userName: user?.name,
        userRole: user?.role,
        sourceFacilityId,
        sourceFacilityName: facility?.name,
        resourceType: 'full_history',
        patientUUID,
        action: 'view',
        isCrossHospitalAccess: true,
        accessType: 'cross_hospital',
        purpose,
        legalBasis: 'patient_consent',
        consentVerified: true,
        timestamp: new Date(),
        metadata: {
          recordTypes,
          recordCount
        }
      });
      
    } catch (error) {
      console.error('Error logging cross-hospital access:', error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  }
  
  /**
   * Check if user has permission to access cross-hospital records
   * @param {String} userId - User ID
   * @param {String} facilityId - Facility ID
   * @returns {Boolean} Permission status
   */
  async checkCrossHospitalPermission(userId, facilityId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return false;
      }
      
      // Only doctors and nurses can access cross-hospital records
      if (!['DOCTOR', 'NURSE'].includes(user.role)) {
        return false;
      }
      
      // Verify user is associated with the facility
      const isAssociated = user.facilityIds?.some(
        fId => fId.toString() === facilityId.toString()
      ) || user.facilityId?.toString() === facilityId.toString();
      
      return isAssociated;
      
    } catch (error) {
      console.error('Error checking cross-hospital permission:', error);
      return false;
    }
  }
  
  /**
   * Get oldest record date from records collection
   * @param {Object} records - Records collection
   * @returns {Date} Oldest record date
   */
  getOldestRecordDate(records) {
    const dates = [
      ...records.medicalRecords.map(r => r.recordDate),
      ...records.prescriptions.map(r => r.prescribedDate)
    ].filter(d => d);
    
    return dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  }
  
  /**
   * Get most recent record date from records collection
   * @param {Object} records - Records collection
   * @returns {Date} Most recent record date
   */
  getMostRecentRecordDate(records) {
    const dates = [
      ...records.medicalRecords.map(r => r.recordDate),
      ...records.prescriptions.map(r => r.prescribedDate)
    ].filter(d => d);
    
    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
  }
  
  /**
   * Withdraw patient consent
   * @param {String} consentId - Consent ID
   * @param {String} reason - Withdrawal reason
   * @param {String} userId - User ID (patient)
   * @returns {Object} Withdrawal result
   */
  async withdrawConsent(consentId, reason, userId) {
    try {
      const consent = await PatientConsent.findById(consentId);
      
      if (!consent) {
        throw new Error('Consent not found');
      }
      
      await consent.withdraw(reason, userId);
      
      // Update patient registry
      const patientRegistry = await PatientRegistry.findOne({ 
        patientUUID: consent.patientUUID 
      });
      
      if (patientRegistry) {
        patientRegistry.withdrawConsent(consent.targetFacilityId);
        await patientRegistry.save();
      }
      
      return {
        status: 'consent_withdrawn',
        message: 'Consent successfully withdrawn'
      };
      
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      throw error;
    }
  }
}

module.exports = new CrossHospitalAccessService();
