import React from "react";
import { Database, Globe, Smartphone, Server, ShieldCheck, Cloud, Box, Activity, Cable, HardDrive, Layers, Users, Heart, Calendar, FileText, MessageSquare, CreditCard, TestTube, Stethoscope, UserCheck, Settings } from "lucide-react";

// Simple arrow component using borders
const Arrow = ({ className = "", label = "" }) => (
  <div className={`relative ${className}`}>
    <div className="h-0 border-t-2" />
    <div className="absolute -right-2 -top-2 rotate-45 w-3 h-3 border-t-2 border-r-2" />
    {label && (
      <span className="absolute -top-6 text-xs text-gray-600 whitespace-nowrap">{label}</span>
    )}
  </div>
);

const Pill = ({ icon: Icon, title, subtitle, color = "gray" }) => {
  const colorClasses = {
    gray: "bg-white/80 backdrop-blur border",
    blue: "bg-blue-50/80 backdrop-blur border-blue-200",
    green: "bg-green-50/80 backdrop-blur border-green-200",
    purple: "bg-purple-50/80 backdrop-blur border-purple-200",
    red: "bg-red-50/80 backdrop-blur border-red-200"
  };

  return (
    <div className={`flex items-center gap-3 ${colorClasses[color]} rounded-2xl shadow-sm px-4 py-3`}>
      <div className="p-2 rounded-xl bg-white border">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
};

const Card = ({ title, icon: Icon, children, color = "white" }) => {
  const colorClasses = {
    white: "bg-white",
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50"
  };

  return (
    <div className={`${colorClasses[color]} rounded-2xl border shadow-sm p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default function HospitalArchitectureBlueprint() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏥 Hospital Management System Architecture</h1>
          <p className="text-lg text-gray-600 mb-4">MediConnect Healthcare - South African Hospital Management Platform</p>
          <div className="bg-white/80 backdrop-blur rounded-xl border p-4">
            <p className="text-sm text-gray-700">
              <strong>C4 Model Architecture:</strong> Context → Containers → Components → Code. 
              Clean Architecture with MERN Stack, MongoDB, multilingual support (11 SA languages), 
              role-based access control, and comprehensive healthcare workflows.
            </p>
          </div>
        </header>

        {/* Context Level (C4 Level 1) - Users & External Systems */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🌍 Context Level - Users & External Systems</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <Card title="Healthcare Users" icon={Users} color="blue">
                <div className="space-y-3">
                  <Pill icon={Heart} title="Patients" subtitle="Book appointments, view records, manage health" color="blue" />
                  <Pill icon={Stethoscope} title="Doctors" subtitle="Manage patients, appointments, prescriptions" color="green" />
                  <Pill icon={UserCheck} title="Nurses" subtitle="Patient care, medical records, schedules" color="purple" />
                  <Pill icon={Settings} title="Administrators" subtitle="System management, user oversight, reports" color="red" />
                </div>
              </Card>
            </div>

            <div className="lg:col-span-6">
              <Card title="Client Applications" icon={Globe} color="green">
                <div className="space-y-3">
                  <Pill icon={Globe} title="Web Application" subtitle="React + Vite, Material-UI, Responsive" color="blue" />
                  <Pill icon={Smartphone} title="Mobile Ready" subtitle="PWA capabilities, mobile-first design" color="green" />
                  <Pill icon={Globe} title="Multi-language" subtitle="11 South African official languages" color="purple" />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Container Level (C4 Level 2) - High-level System Components */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">📦 Container Level - System Components</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <Card title="Frontend Layer" icon={Globe} color="blue">
                <div className="space-y-3">
                  <div className="bg-blue-100 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">React SPA (Vite)</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Material-UI components</li>
                      <li>React Router (role-based routing)</li>
                      <li>TanStack Query (data fetching)</li>
                      <li>Context API (auth, language)</li>
                    </ul>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Features</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Role-based dashboards</li>
                      <li>Real-time messaging</li>
                      <li>Multilingual support</li>
                      <li>Responsive design</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card title="Backend API" icon={Server} color="green">
                <div className="space-y-3">
                  <div className="bg-green-100 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Node.js + Express</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>RESTful API endpoints</li>
                      <li>JWT authentication</li>
                      <li>Role-based authorization</li>
                      <li>Input validation & sanitization</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Services</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Email service (Nodemailer)</li>
                      <li>File upload handling</li>
                      <li>WebSocket for real-time</li>
                      <li>Appointment scheduling</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card title="Data Layer" icon={Database} color="purple">
                <div className="space-y-3">
                  <div className="bg-purple-100 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">MongoDB</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Document-based storage</li>
                      <li>Flexible schema design</li>
                      <li>Mongoose ODM</li>
                      <li>Indexed queries</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">External Services</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Gmail SMTP (emails)</li>
                      <li>File storage (local/cloud)</li>
                      <li>WebSocket connections</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Component Level (C4 Level 3) - Detailed System Modules */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🔧 Component Level - Healthcare Modules</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <Card title="Core Healthcare Components" icon={Heart}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <div className="text-sm font-semibold">Appointment System</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Booking & scheduling</li>
                      <li>Doctor availability</li>
                      <li>Email confirmations</li>
                      <li>Rescheduling & cancellation</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <div className="text-sm font-semibold">Medical Records</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Patient history</li>
                      <li>Diagnosis tracking</li>
                      <li>Treatment plans</li>
                      <li>Document management</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                      <TestTube className="w-4 h-4" />
                      <div className="text-sm font-semibold">Lab & Prescriptions</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Test results</li>
                      <li>Prescription management</li>
                      <li>Medication tracking</li>
                      <li>Lab report generation</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <div className="text-sm font-semibold">Billing System</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Invoice generation</li>
                      <li>Payment processing</li>
                      <li>Insurance claims</li>
                      <li>Financial reporting</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-6">
              <Card title="System Infrastructure" icon={Layers}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <div className="text-sm font-semibold">Authentication</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>JWT token-based auth</li>
                      <li>Role-based access control</li>
                      <li>Email verification</li>
                      <li>Password security</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <div className="text-sm font-semibold">Communication</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Real-time messaging</li>
                      <li>Email notifications</li>
                      <li>WebSocket connections</li>
                      <li>Appointment reminders</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4" />
                      <div className="text-sm font-semibold">Localization</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>11 SA official languages</li>
                      <li>Context-based translation</li>
                      <li>Language persistence</li>
                      <li>Cultural adaptation</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4" />
                      <div className="text-sm font-semibold">Monitoring</div>
                    </div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Error logging</li>
                      <li>Performance tracking</li>
                      <li>User activity logs</li>
                      <li>System health checks</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Data Architecture */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🗄️ Data Architecture & Models</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <Card title="MongoDB Collections & Relationships" icon={Database}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">User Management</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Users:</strong> Patients, Doctors, Nurses, Admins</li>
                      <li><strong>Roles:</strong> RBAC with permissions</li>
                      <li><strong>Profiles:</strong> Role-specific data</li>
                      <li><strong>Authentication:</strong> JWT tokens</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Healthcare Data</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Appointments:</strong> Scheduling system</li>
                      <li><strong>Medical Records:</strong> Patient history</li>
                      <li><strong>Prescriptions:</strong> Medication data</li>
                      <li><strong>Test Results:</strong> Lab reports</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Operations</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Bills:</strong> Financial records</li>
                      <li><strong>Messages:</strong> Communication</li>
                      <li><strong>Leave:</strong> Staff management</li>
                      <li><strong>Facilities:</strong> Hospital resources</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card title="Data Flow Patterns" icon={Activity}>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Request Flow</div>
                    <div className="text-xs text-gray-700">
                      Client → Auth Middleware → Route Handler → Service Layer → MongoDB
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Real-time Updates</div>
                    <div className="text-xs text-gray-700">
                      WebSocket connections for live messaging and notifications
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Email Notifications</div>
                    <div className="text-xs text-gray-700">
                      Async email service for appointments and system updates
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Technology Stack & Deployment */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🚀 Technology Stack & Deployment</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <Card title="MERN Stack Implementation" icon={Server}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Frontend (React)</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Build Tool:</strong> Vite (fast development)</li>
                      <li><strong>UI Framework:</strong> Material-UI v5</li>
                      <li><strong>State Management:</strong> Context API + TanStack Query</li>
                      <li><strong>Routing:</strong> React Router v6</li>
                      <li><strong>Forms:</strong> React Hook Form + Yup</li>
                      <li><strong>Charts:</strong> Chart.js + React Chart.js 2</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Backend (Node.js)</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Framework:</strong> Express.js</li>
                      <li><strong>Database:</strong> MongoDB + Mongoose ODM</li>
                      <li><strong>Authentication:</strong> JWT + bcryptjs</li>
                      <li><strong>Email:</strong> Nodemailer + Gmail SMTP</li>
                      <li><strong>Real-time:</strong> WebSocket (ws)</li>
                      <li><strong>Security:</strong> CORS, input validation</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Development Tools</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Package Manager:</strong> npm</li>
                      <li><strong>Linting:</strong> ESLint</li>
                      <li><strong>Dev Server:</strong> Nodemon (backend)</li>
                      <li><strong>Environment:</strong> dotenv configuration</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Production Ready</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Build:</strong> Optimized production builds</li>
                      <li><strong>Security:</strong> JWT token management</li>
                      <li><strong>Performance:</strong> Code splitting, lazy loading</li>
                      <li><strong>Monitoring:</strong> Error logging & tracking</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card title="Deployment Architecture" icon={Cloud}>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Current Setup</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Frontend: Vite dev server (port 5173)</li>
                      <li>Backend: Express server (port 5000)</li>
                      <li>Database: MongoDB (local/cloud)</li>
                      <li>Email: Gmail SMTP integration</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Production Options</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li><strong>Frontend:</strong> Netlify, Vercel, AWS S3</li>
                      <li><strong>Backend:</strong> Heroku, AWS EC2, DigitalOcean</li>
                      <li><strong>Database:</strong> MongoDB Atlas</li>
                      <li><strong>CDN:</strong> CloudFlare, AWS CloudFront</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border">
                    <div className="text-sm font-semibold mb-2">Scalability</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Horizontal scaling with load balancers</li>
                      <li>Database sharding for large datasets</li>
                      <li>Redis caching for performance</li>
                      <li>Microservices architecture ready</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🔒 Security & Healthcare Compliance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-12">
              <Card title="Healthcare Data Security & Privacy" icon={ShieldCheck}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border p-3 bg-red-50">
                    <div className="text-sm font-semibold mb-2">Authentication & Authorization</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>JWT token-based authentication</li>
                      <li>Role-based access control (RBAC)</li>
                      <li>Password hashing (bcryptjs)</li>
                      <li>Email verification system</li>
                      <li>Session management</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-blue-50">
                    <div className="text-sm font-semibold mb-2">Data Protection</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Encrypted data transmission (HTTPS)</li>
                      <li>Input validation & sanitization</li>
                      <li>SQL injection prevention</li>
                      <li>XSS protection</li>
                      <li>CORS configuration</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-green-50">
                    <div className="text-sm font-semibold mb-2">Healthcare Compliance</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Patient data privacy (POPIA compliance)</li>
                      <li>Medical record confidentiality</li>
                      <li>Audit trails for data access</li>
                      <li>Secure file handling</li>
                      <li>Data retention policies</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-3 bg-purple-50">
                    <div className="text-sm font-semibold mb-2">Monitoring & Logging</div>
                    <ul className="text-xs list-disc ml-4 space-y-1 text-gray-700">
                      <li>Error logging & tracking</li>
                      <li>User activity monitoring</li>
                      <li>Security event logging</li>
                      <li>Performance monitoring</li>
                      <li>Backup & recovery procedures</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <footer className="mt-8 p-6 bg-white/80 backdrop-blur rounded-xl border">
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>🏥 MediConnect Healthcare System:</strong> A comprehensive hospital management platform designed for South African healthcare providers.</p>
            <p><strong>🌍 Multilingual Support:</strong> Full support for all 11 South African official languages with cultural adaptation.</p>
            <p><strong>🔒 Security First:</strong> Healthcare-grade security with POPIA compliance and role-based access control.</p>
            <p><strong>📱 Modern Architecture:</strong> MERN stack with clean architecture principles, scalable and maintainable codebase.</p>
            <p><strong>🚀 Production Ready:</strong> Comprehensive error handling, email notifications, real-time features, and deployment-ready configuration.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
