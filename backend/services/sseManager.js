// SSE Manager for real-time notifications
class SSEManager {
  constructor() {
    this.clients = new Map(); // Map of patientId -> Set of Response objects
  }

  // Add a client connection for a specific patient
  addClient(patientId, response) {
    if (!this.clients.has(patientId)) {
      this.clients.set(patientId, new Set());
    }
    this.clients.get(patientId).add(response);

    console.log(`SSE client added for patient ${patientId}. Total clients:`, this.clients.get(patientId).size);

    // Remove client when connection closes
    response.on('close', () => {
      this.removeClient(patientId, response);
    });
  }

  // Remove a client connection
  removeClient(patientId, response) {
    const clientSet = this.clients.get(patientId);
    if (clientSet) {
      clientSet.delete(response);
      if (clientSet.size === 0) {
        this.clients.delete(patientId);
      }
      console.log(`SSE client removed for patient ${patientId}`);
    }
  }

  // Broadcast data to all clients listening for a specific patient
  broadcastToPatient(patientId, data) {
    const clientSet = this.clients.get(patientId);
    if (!clientSet) return;

    const message = `data: ${JSON.stringify(data)}\n\n`;

    clientSet.forEach(response => {
      try {
        response.write(message);
      } catch (error) {
        console.error('Error sending SSE to client:', error);
        this.removeClient(patientId, response);
      }
    });
  }

  // Send data to a specific client
  sendToClient(response, data) {
    try {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      response.write(message);
    } catch (error) {
      console.error('Error sending SSE to specific client:', error);
    }
  }

  // Get count of active connections for a patient
  getClientCount(patientId) {
    const clientSet = this.clients.get(patientId);
    return clientSet ? clientSet.size : 0;
  }
}

const sseManager = new SSEManager();

module.exports = { sseManager };
