import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// South Africa's 11 official languages
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  af: {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    flag: '🇿🇦'
  },
  zu: {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    flag: '🇿🇦'
  },
  xh: {
    code: 'xh',
    name: 'Xhosa',
    nativeName: 'isiXhosa',
    flag: '🇿🇦'
  },
  st: {
    code: 'st',
    name: 'Sotho',
    nativeName: 'Sesotho',
    flag: '🇿🇦'
  },
  tn: {
    code: 'tn',
    name: 'Tswana',
    nativeName: 'Setswana',
    flag: '🇿🇦'
  },
  ss: {
    code: 'ss',
    name: 'Swati',
    nativeName: 'siSwati',
    flag: '🇿🇦'
  },
  nr: {
    code: 'nr',
    name: 'Ndebele',
    nativeName: 'isiNdebele',
    flag: '🇿🇦'
  },
  ts: {
    code: 'ts',
    name: 'Tsonga',
    nativeName: 'Xitsonga',
    flag: '🇿🇦'
  },
  ve: {
    code: 've',
    name: 'Venda',
    nativeName: 'Tshivenḓa',
    flag: '🇿🇦'
  },
  nso: {
    code: 'nso',
    name: 'Northern Sotho',
    nativeName: 'Sepedi',
    flag: '🇿🇦'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferredLanguage', languageCode);
    }
  };

  // Translation function
  const t = (key, fallback = key) => {
    return translations[currentLanguage]?.[key] || translations['en']?.[key] || fallback;
  };

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // For now, we'll define translations inline
        // In a real app, these would be loaded from separate files
        const allTranslations = {
          en: {
            // Login page
            'login.title': 'Welcome Back',
            'login.subtitle': 'Sign in to access your healthcare dashboard',
            'login.userId': 'User ID',
            'login.password': 'Password',
            'login.signIn': 'Sign In',
            'login.forgotPassword': 'Forgot Password?',
            'login.createAccount': 'Create Account',
            'login.demoAccounts': 'Demo Accounts',
            'login.selectLanguage': 'Select Language',
            'login.loading': 'Signing in...',
            
            // Demo accounts
            'demo.patient': 'Patient Account',
            'demo.nurse': 'Nurse Account',
            'demo.doctor': 'Doctor Account',
            'demo.admin': 'Admin Account',
            'demo.clickToFill': 'Click any demo account above to auto-fill credentials for testing',
            
            // Common
            'common.welcome': 'Welcome',
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'common.success': 'Success',
            'common.cancel': 'Cancel',
            'common.save': 'Save',
            'common.close': 'Close',
            
            // Healthcare specific
            'healthcare.system': 'Healthcare Management System',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Your trusted healthcare partner in South Africa',
            'healthcare.professional': 'Professional healthcare management for South African providers',
            
            // Patient Dashboard
            'dashboard.welcome': 'Welcome',
            'dashboard.overview': "Here's an overview of your health information and upcoming activities.",
            'dashboard.appointments': 'Appointments',
            'dashboard.upcomingAppointments': 'Upcoming Appointments',
            'dashboard.noUpcomingAppointments': 'No upcoming appointments',
            'dashboard.viewAllAppointments': 'View All Appointments',
            'dashboard.bookAppointment': 'Book Appointment',
            'dashboard.testResults': 'Test Results',
            'dashboard.recentTestResults': 'Recent Test Results',
            'dashboard.noRecentTestResults': 'No recent test results',
            'dashboard.viewAllResults': 'View All Results',
            'dashboard.viewAll': 'View All',
            'dashboard.prescriptions': 'Prescriptions',
            'dashboard.activePrescriptions': 'Active Prescriptions',
            'dashboard.noPrescriptions': 'No active prescriptions',
            'dashboard.messages': 'Messages',
            'dashboard.unreadMessages': 'Unread Messages',
            'dashboard.noMessages': 'No new messages',
            'dashboard.billing': 'Billing',
            'dashboard.pendingBills': 'Pending Bills',
            'dashboard.noBills': 'No pending bills',
            'dashboard.payNow': 'Pay Now',
            'dashboard.healthSummary': 'Health Summary',
            'dashboard.totalAppointments': 'Total Appointments',
            'dashboard.pendingTests': 'Pending Tests',
            'dashboard.activeMedications': 'Active Medications',
            'dashboard.outstandingBalance': 'Outstanding Balance',
            'dashboard.quickActions': 'Quick Actions',
            'dashboard.healthReminders': 'Health Reminders',
            'dashboard.medicationReminder': 'Remember to take your daily medications as prescribed.',
            'dashboard.appointmentReminder': 'You have {{count}} upcoming appointment(s) this week.',
            'dashboard.billReminder': 'You have {{count}} pending bill(s) that require attention.',
            'dashboard.todayAppointments': 'Today\'s Appointments',
            'dashboard.totalPatients': 'Total Patients',
            'dashboard.pendingReports': 'Pending Reports',
            'dashboard.completedToday': 'Completed Today',
            'dashboard.todaySchedule': 'Today\'s Schedule',
            'dashboard.noAppointments': 'No appointments scheduled for today',
            'dashboard.recentActivity': 'Recent Activity',
            
            // Navigation
            'nav.patientPortal': 'Patient Portal',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Health Summary',
            'nav.appointments': 'Appointments',
            'nav.medicalRecords': 'Medical Records',
            'nav.prescriptions': 'Prescriptions',
            'nav.testResults': 'Test Results',
            'nav.billing': 'Billing',
            'nav.messages': 'Messages',
            'nav.profile': 'Profile',
            'nav.settings': 'Settings',
            'nav.logout': 'Logout',
            'nav.patients': 'My Patients',
            'nav.consultations': 'Consultations',
            'nav.reports': 'Reports & Analytics',
            
            // Quick Actions
            'quickActions.bookAppointment': 'Book Appointment',
            'quickActions.bookAppointmentDesc': 'Schedule a new appointment with your healthcare provider',
            'quickActions.messages': 'Messages',
            'quickActions.messagesDesc': 'View and send messages to your healthcare team',
            'quickActions.testResults': 'View Test Results',
            'quickActions.testResultsDesc': 'Check your latest lab results and reports',
            'quickActions.prescriptions': 'Prescriptions',
            'quickActions.prescriptionsDesc': 'Manage your current medications and refills',
            'quickActions.medicalRecords': 'Medical Records',
            'quickActions.medicalRecordsDesc': 'Access your complete medical history',
            'quickActions.billing': 'Billing & Payments',
            'quickActions.billingDesc': 'View bills and make payments online',
            'quickActions.newAppointment': 'Schedule Appointment',
            'quickActions.newAppointmentDesc': 'Schedule a new patient appointment',
            'quickActions.viewPatients': 'View Patients',
            'quickActions.viewPatientsDesc': 'Access patient records and history',
            'quickActions.reports': 'Medical Reports',
            'quickActions.reportsDesc': 'Review and create medical reports',
            
            // Appointments
            'appointments.schedule': 'Schedule Appointment',
            'appointments.upcoming': 'Upcoming Appointments',
            'appointments.past': 'Past Appointments',
            'appointments.cancelled': 'Cancelled',
            'appointments.confirmed': 'Confirmed',
            'appointments.pending': 'Pending',
            'appointments.completed': 'Completed',
            'appointments.doctor': 'Doctor',
            'appointments.date': 'Date',
            'appointments.time': 'Time',
            'appointments.reason': 'Reason',
            'appointments.cancel': 'Cancel',
            'appointments.reschedule': 'Reschedule',
            
            // Medical Records
            'medical.records': 'Medical Records',
            'medical.history': 'Medical History',
            'medical.allergies': 'Allergies',
            'medical.conditions': 'Medical Conditions',
            'medical.medications': 'Current Medications',
            'medical.emergencyContact': 'Emergency Contact',
            'medical.bloodType': 'Blood Type',
            'medical.height': 'Height',
            'medical.weight': 'Weight',
            'medical.bmi': 'BMI',
            
            // Common Actions
            'action.view': 'View',
            'action.edit': 'Edit',
            'action.delete': 'Delete',
            'action.download': 'Download',
            'action.print': 'Print',
            'action.share': 'Share',
            'action.update': 'Update',
            'action.submit': 'Submit',
            'action.confirm': 'Confirm',
            'action.back': 'Back',
            'action.next': 'Next',
            
            // Doctor Portal
            'doctor.portal': 'Doctor Portal',
            'role.doctor': 'Doctor',
            'general.practitioner': 'General Practitioner',
            
            // Notifications
            'notifications.title': 'Notifications',
            'notifications.unread': 'unread',
            'notifications.viewAll': 'View All Notifications',
            'notifications.newAppointment': 'New Appointment Request',
            'notifications.appointmentFrom': 'Appointment request from',
            'notifications.labResults': 'Lab Results Ready',
            'notifications.labResultsFor': 'Lab results ready for',
            'notifications.urgentConsult': 'Urgent Consultation',
            'notifications.urgentConsultFor': 'Urgent consultation needed for patient',
            'action.previous': 'Previous',
            
            // Status Messages
            'status.loading': 'Loading...',
            'status.saving': 'Saving...',
            'status.saved': 'Saved successfully',
            'status.error': 'An error occurred',
            'status.noData': 'No data available',
            'status.updated': 'Updated successfully',
            'status.deleted': 'Deleted successfully'
          },
          
          af: {
            // Login page
            'login.title': 'Welkom Terug',
            'login.subtitle': 'Meld aan om toegang tot jou gesondheidsorg dashboard te kry',
            'login.userId': 'Gebruiker ID',
            'login.password': 'Wagwoord',
            'login.signIn': 'Meld Aan',
            'login.forgotPassword': 'Wagwoord Vergeet?',
            'login.createAccount': 'Skep Rekening',
            'login.demoAccounts': 'Demo Rekeninge',
            'login.selectLanguage': 'Kies Taal',
            'login.loading': 'Meld aan...',
            
            // Demo accounts
            'demo.patient': 'Pasiënt Rekening',
            'demo.nurse': 'Verpleegster Rekening',
            'demo.doctor': 'Dokter Rekening',
            'demo.admin': 'Admin Rekening',
            'demo.clickToFill': 'Klik enige demo rekening hierbo om outomaties geloofsbriewe in te vul vir toetsing',
            
            // Common
            'common.welcome': 'Welkom',
            'common.loading': 'Laai...',
            'common.error': 'Fout',
            'common.success': 'Sukses',
            'common.cancel': 'Kanselleer',
            'common.save': 'Stoor',
            'common.close': 'Sluit',
            
            // Healthcare specific
            'healthcare.system': 'Gesondheidsorg Bestuur Stelsel',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Jou vertroude gesondheidsorg vennoot in Suid-Afrika',
            'healthcare.professional': 'Professionele gesondheidsorg bestuur vir Suid-Afrikaanse verskaffers',
            
            // Patient Dashboard - Afrikaans
            'dashboard.welcome': 'Welkom',
            'dashboard.overview': 'Hier is n oorsig van jou gesondheid inligting en komende aktiwiteite.',
            'dashboard.appointments': 'Afsprake',
            'dashboard.upcomingAppointments': 'Komende Afsprake',
            'dashboard.noAppointments': 'Geen komende afsprake nie',
            'dashboard.bookAppointment': 'Boek Afspraak',
            'dashboard.testResults': 'Toets Resultate',
            'dashboard.recentResults': 'Onlangse Toets Resultate',
            'dashboard.noResults': 'Geen onlangse toets resultate nie',
            'dashboard.viewAll': 'Sien Alles',
            'dashboard.prescriptions': 'Voorskrifte',
            'dashboard.activePrescriptions': 'Aktiewe Voorskrifte',
            'dashboard.noPrescriptions': 'Geen aktiewe voorskrifte nie',
            'dashboard.messages': 'Boodskappe',
            'dashboard.unreadMessages': 'Ongelese Boodskappe',
            'dashboard.noMessages': 'Geen nuwe boodskappe nie',
            'dashboard.billing': 'Fakturering',
            'dashboard.pendingBills': 'Hangende Rekeninge',
            'dashboard.noBills': 'Geen hangende rekeninge nie',
            'dashboard.payNow': 'Betaal Nou',
            'dashboard.healthSummary': 'Gesondheid Opsomming',
            'dashboard.totalAppointments': 'Totale Afsprake',
            'dashboard.pendingTests': 'Hangende Toetse',
            'dashboard.activeMedications': 'Aktiewe Medikasie',
            'dashboard.outstandingBalance': 'Uitstaande Balans',
            'dashboard.noUpcomingAppointments': 'Geen komende afsprake nie',
            'dashboard.viewAllAppointments': 'Bekyk Alle Afsprake',
            'dashboard.recentTestResults': 'Onlangse Toets Resultate',
            'dashboard.noRecentTestResults': 'Geen onlangse toets resultate nie',
            'dashboard.viewAllResults': 'Bekyk Alle Resultate',
            'dashboard.quickActions': 'Vinnige Aksies',
            'dashboard.healthReminders': 'Gesondheid Herinneringe',
            'dashboard.medicationReminder': 'Onthou om jou daaglikse medikasie soos voorgeskryf te neem.',
            'dashboard.appointmentReminder': 'Jy het {{count}} komende afspraak(e) hierdie week.',
            'dashboard.billReminder': 'Jy het {{count}} hangende rekening(e) wat aandag benodig.',
            
            // Navigation - Afrikaans
            'nav.patientPortal': 'Pasiënt Portaal',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Gesondheid Opsomming',
            'nav.appointments': 'Afsprake',
            'nav.medicalRecords': 'Mediese Rekords',
            'nav.prescriptions': 'Voorskrifte',
            'nav.testResults': 'Toets Resultate',
            'nav.billing': 'Fakturering',
            'nav.messages': 'Boodskappe',
            'nav.profile': 'Profiel',
            'nav.settings': 'Instellings',
            'nav.logout': 'Teken Uit',
            
            // Quick Actions - Afrikaans
            'quickActions.bookAppointment': 'Boek Afspraak',
            'quickActions.bookAppointmentDesc': 'Skeduleer n nuwe afspraak met jou gesondheidsorg verskaffer',
            'quickActions.messages': 'Boodskappe',
            'quickActions.messagesDesc': 'Bekyk en stuur boodskappe na jou gesondheidsorg span',
            'quickActions.testResults': 'Bekyk Toets Resultate',
            'quickActions.testResultsDesc': 'Kyk jou nuutste laboratorium resultate en verslae',
            'quickActions.prescriptions': 'Voorskrifte',
            'quickActions.prescriptionsDesc': 'Bestuur jou huidige medikasie en hervullings',
            'quickActions.medicalRecords': 'Mediese Rekords',
            'quickActions.medicalRecordsDesc': 'Toegang tot jou volledige mediese geskiedenis',
            'quickActions.billing': 'Fakturering & Betalings',
            'quickActions.billingDesc': 'Bekyk rekeninge en maak aanlyn betalings',
            
            // Appointments - Afrikaans
            'appointments.schedule': 'Skeduleer Afspraak',
            'appointments.upcoming': 'Komende Afsprake',
            'appointments.past': 'Vorige Afsprake',
            'appointments.cancelled': 'Gekanselleer',
            'appointments.confirmed': 'Bevestig',
            'appointments.pending': 'Hangend',
            'appointments.completed': 'Voltooi',
            'appointments.doctor': 'Dokter',
            'appointments.date': 'Datum',
            'appointments.time': 'Tyd',
            'appointments.reason': 'Rede',
            'appointments.cancel': 'Kanselleer',
            'appointments.reschedule': 'Herskeduleer',
            
            // Medical Records - Afrikaans
            'medical.records': 'Mediese Rekords',
            'medical.history': 'Mediese Geskiedenis',
            'medical.allergies': 'Allergieë',
            'medical.conditions': 'Mediese Toestande',
            'medical.medications': 'Huidige Medikasie',
            'medical.emergencyContact': 'Nood Kontak',
            'medical.bloodType': 'Bloed Tipe',
            'medical.height': 'Hoogte',
            'medical.weight': 'Gewig',
            'medical.bmi': 'BMI',
            
            // Common Actions - Afrikaans
            'action.view': 'Bekyk',
            'action.edit': 'Wysig',
            'action.delete': 'Verwyder',
            'action.download': 'Laai Af',
            'action.print': 'Druk',
            'action.share': 'Deel',
            'action.update': 'Opdateer',
            'action.submit': 'Dien In',
            'action.confirm': 'Bevestig',
            'action.back': 'Terug',
            'action.next': 'Volgende',
            'action.previous': 'Vorige',
            
            // Status Messages - Afrikaans
            'status.loading': 'Laai...',
            'status.saving': 'Stoor...',
            'status.saved': 'Suksesvol gestoor',
            'status.error': 'n Fout het voorgekom',
            'status.noData': 'Geen data beskikbaar nie',
            'status.updated': 'Suksesvol opdateer',
            'status.deleted': 'Suksesvol verwyder'
          },
          
          zu: {
            // Login page
            'login.title': 'Siyakwamukela Futhi',
            'login.subtitle': 'Ngena ukuze ufinyelele ku-dashboard yakho yezempilo',
            'login.userId': 'ID Yomsebenzisi',
            'login.password': 'Iphasiwedi',
            'login.signIn': 'Ngena',
            'login.forgotPassword': 'Ukhohlwe Iphasiwedi?',
            'login.createAccount': 'Dala I-akhawunti',
            'login.demoAccounts': 'Ama-akhawunti Okubonisa',
            'login.selectLanguage': 'Khetha Ulimi',
            'login.loading': 'Kuyangena...',
            
            // Demo accounts
            'demo.patient': 'I-akhawunti Yesiguli',
            'demo.nurse': 'I-akhawunti Yomnesi',
            'demo.doctor': 'I-akhawunti Yodokotela',
            'demo.admin': 'I-akhawunti Yomphathi',
            'demo.clickToFill': 'Chofoza noma yiluphi i-akhawunti yokubonisa ngenhla ukugcwalisa ngokuzenzakalela izincwadi zokugcina ukuze uhlole',
            
            // Common
            'common.welcome': 'Siyakwamukela',
            'common.loading': 'Kuyalayisha...',
            'common.error': 'Iphutha',
            'common.success': 'Impumelelo',
            'common.cancel': 'Khansela',
            'common.save': 'Gcina',
            'common.close': 'Vala',
            
            // Healthcare specific
            'healthcare.system': 'Uhlelo Lokuphatha Ezempilo',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Iqembu lakho elithembekile lezempilo eNingizimu Afrika',
            'healthcare.professional': 'Ukuphatha ezempilo kochwepheshe kubahlinzeki baseNingizimu Afrika',
            
            // Patient Dashboard - Zulu
            'dashboard.welcome': 'Siyakwamukela',
            'dashboard.overview': 'Nali uhlu lwemininingwane yakho yezempilo nemisebenzi ezayo.',
            'dashboard.upcomingAppointments': 'Ama-aphoyintimenti Azayo',
            'dashboard.noUpcomingAppointments': 'Awekho ama-aphoyintimenti azayo',
            'dashboard.viewAllAppointments': 'Buka Wonke Ama-aphoyintimenti',
            'dashboard.recentTestResults': 'Imiphumela Yamatest Yakamuva',
            'dashboard.noRecentTestResults': 'Ayikho imiphumela yamatest yakamuva',
            'dashboard.viewAllResults': 'Buka Yonke Imiphumela',
            'dashboard.quickActions': 'Izenzo Ezisheshayo',
            'dashboard.healthReminders': 'Izikhumbuzi Zezempilo',
            'dashboard.medicationReminder': 'Khumbula ukuthatha imithi yakho yansuku zonke njengoba kuqondisiwe.',
            'dashboard.appointmentReminder': 'Unama-aphoyintimenti angu-{{count}} azayo kuleli viki.',
            'dashboard.billReminder': 'Unamabhili angu-{{count}} asalindile adinga ukunakwa.',
            'dashboard.activeMedications': 'Imithi Esebenzayo',
            'dashboard.pendingTests': 'Amatest Alindile',
            'dashboard.outstandingBalance': 'Ibhalansi Esele',
            'dashboard.healthSummary': 'Isifinyezo Sezempilo',
            
            // Navigation - Zulu
            'nav.patientPortal': 'Isango Lesiguli',
            'nav.dashboard': 'I-Dashboard',
            'nav.healthSummary': 'Isifinyezo Sezempilo',
            'nav.appointments': 'Ama-aphoyintimenti',
            'nav.medicalRecords': 'Amarekhodi Ezokwelapha',
            'nav.prescriptions': 'Amaphreskiripshini',
            'nav.testResults': 'Imiphumela Yamatest',
            'nav.billing': 'Ukubhayela',
            'nav.messages': 'Imiyalezo',
            'nav.profile': 'Iphrofayili',
            'nav.settings': 'Izilungiselelo',
            'nav.logout': 'Phuma',
            
            // Quick Actions - Zulu
            'quickActions.bookAppointment': 'Bhuka I-aphoyintimenti',
            'quickActions.bookAppointmentDesc': 'Hlela i-aphoyintimenti entsha nomhlinzeki wakho wezempilo',
            'quickActions.messages': 'Imiyalezo',
            'quickActions.messagesDesc': 'Buka futhi uthumele imiyalezo eqenjini lakho lezempilo',
            'quickActions.testResults': 'Buka Imiphumela Yamatest',
            'quickActions.testResultsDesc': 'Hlola imiphumela yakho yakamuva yaselabhorithi nemibiko',
            'quickActions.prescriptions': 'Amaphreskiripshini',
            'quickActions.prescriptionsDesc': 'Phatha imithi yakho yamanje nokugcwalisa kabusha',
            'quickActions.medicalRecords': 'Amarekhodi Ezokwelapha',
            'quickActions.medicalRecordsDesc': 'Finyelela kumlando wakho ophelele wezokwelapha',
            'quickActions.billing': 'Ukubhayela & Izinkokhelo',
            'quickActions.billingDesc': 'Buka amabhili futhi wenze izinkokhelo ku-intanethi'
          },
          
          xh: {
            // Login page
            'login.title': 'Wamkelekile Kwakhona',
            'login.subtitle': 'Ngena ukuze ufikelele kwi-dashboard yakho yezempilo',
            'login.userId': 'ID Yomsebenzisi',
            'login.password': 'Igama eligqithisiweyo',
            'login.signIn': 'Ngena',
            'login.forgotPassword': 'Ulibale Igama Eligqithisiweyo?',
            'login.createAccount': 'Yenza I-akhawunti',
            'login.demoAccounts': 'Ii-akhawunti Zokubonisa',
            'login.selectLanguage': 'Khetha Ulwimi',
            'login.loading': 'Kuyangena...',
            
            // Demo accounts
            'demo.patient': 'I-akhawunti Yesigulana',
            'demo.nurse': 'I-akhawunti Yomongikazi',
            'demo.doctor': 'I-akhawunti Yogqirha',
            'demo.admin': 'I-akhawunti Yolawulo',
            'demo.clickToFill': 'Cofa naliphi na i-akhawunti yokubonisa ngasentla ukuzalisa ngokuzenzekelayo izatifikethi zokuhlola',
            
            // Common
            'common.welcome': 'Wamkelekile',
            'common.loading': 'Kuyalayisha...',
            'common.error': 'Impazamo',
            'common.success': 'Impumelelo',
            'common.cancel': 'Rhoxisa',
            'common.save': 'Gcina',
            'common.close': 'Vala',
            
            // Healthcare specific
            'healthcare.system': 'Inkqubo Yolawulo Lwezempilo',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Iqabane lakho elithembekileyo lezempilo eMzantsi Afrika',
            'healthcare.professional': 'Ulawulo lwezempilo lobugcisa kubaboneleli baseMzantsi Afrika',
            
            // Patient Dashboard - Xhosa
            'dashboard.welcome': 'Wamkelekile',
            'dashboard.overview': 'Nalu uluhlu lwenkcukacha yakho yezempilo kunye nemisebenzi ezayo.',
            'dashboard.upcomingAppointments': 'Iidinga Ezizayo',
            'dashboard.noUpcomingAppointments': 'Akukho madinga azayo',
            'dashboard.viewAllAppointments': 'Jonga Onke Amadinga',
            'dashboard.recentTestResults': 'Iziphumo Zovavanyo Lwakutshanje',
            'dashboard.noRecentTestResults': 'Akukho ziphumo zovavanyo lwakutshanje',
            'dashboard.viewAllResults': 'Jonga Zonke Iziphumo',
            'dashboard.quickActions': 'Izenzo Ezikhawulezayo',
            'dashboard.healthReminders': 'Izikhumbuzi Zezempilo',
            'dashboard.medicationReminder': 'Khumbula ukuthatha amayeza akho yonke imihla njengoko kuchaziwe.',
            'dashboard.appointmentReminder': 'Unadinga ezi-{{count}} ezizayo kule veki.',
            'dashboard.billReminder': 'Uneebhili ezi-{{count}} ezilindileyo ezifuna ingqalelo.',
            'dashboard.activeMedications': 'Amayeza Asebenzayo',
            'dashboard.pendingTests': 'Uvavanyo Olulindileyo',
            'dashboard.outstandingBalance': 'Ibhalansi Eseleyo',
            'dashboard.healthSummary': 'Isishwankathelo Sezempilo',
            
            // Navigation - Xhosa
            'nav.patientPortal': 'Isango Lesigulana',
            'nav.dashboard': 'I-Dashboard',
            'nav.healthSummary': 'Isishwankathelo Sezempilo',
            'nav.appointments': 'Amadinga',
            'nav.medicalRecords': 'Iirekhodi Zezonyango',
            'nav.prescriptions': 'Imiyalelo Yonyango',
            'nav.testResults': 'Iziphumo Zovavanyo',
            'nav.billing': 'Ukubhala Ityala',
            'nav.messages': 'Imiyalezo',
            'nav.profile': 'Iprofayile',
            'nav.settings': 'Iisetingi',
            'nav.logout': 'Phuma',
            
            // Quick Actions - Xhosa
            'quickActions.bookAppointment': 'Bhuka Idinga',
            'quickActions.bookAppointmentDesc': 'Cwangcisa idinga elitsha nomnikezeli wakho wezempilo',
            'quickActions.messages': 'Imiyalezo',
            'quickActions.messagesDesc': 'Jonga kwaye uthumele imiyalezo kwiqela lakho lezempilo',
            'quickActions.testResults': 'Jonga Iziphumo Zovavanyo',
            'quickActions.testResultsDesc': 'Khangela iziphumo zakho zokugqibela zelabhoratri neengxelo',
            'quickActions.prescriptions': 'Imiyalelo Yonyango',
            'quickActions.prescriptionsDesc': 'Lawula amayeza akho angoku kunye nokuzaliswa kwakhona',
            'quickActions.medicalRecords': 'Iirekhodi Zezonyango',
            'quickActions.medicalRecordsDesc': 'Fikelela kwimbali yakho epheleleyo yezonyango',
            'quickActions.billing': 'Ukubhala Ityala & Iintlawulo',
            'quickActions.billingDesc': 'Jonga iibhili kwaye wenze iintlawulo kwi-intanethi'
          },
          
          st: {
            // Login page - Sesotho
            'login.title': 'Rea u Amohela Hape',
            'login.subtitle': 'Kena ho fihlella dashboard ya hao ya bophelo bo botle',
            'login.userId': 'ID ya Mosebelisi',
            'login.password': 'Phasewete',
            'login.signIn': 'Kena',
            'login.forgotPassword': 'U lebetse Phasewete?',
            'login.createAccount': 'Theha Akhaonto',
            'login.demoAccounts': 'Li-akhaonto tsa Demo',
            'login.selectLanguage': 'Khetha Puo',
            'login.loading': 'Ho kena...',
            
            // Demo accounts
            'demo.patient': 'Akhaonto ya Mokuli',
            'demo.nurse': 'Akhaonto ya Mooki',
            'demo.doctor': 'Akhaonto ya Ngaka',
            'demo.admin': 'Akhaonto ya Motlatsi',
            'demo.clickToFill': 'Tobetsa akhaonto efe kapa efe ya demo ho tlatsa litokelo tsa ho kena bakeng sa teko',
            
            // Common
            'common.welcome': 'Rea u Amohela',
            'common.loading': 'Ho laela...',
            'common.error': 'Phoso',
            'common.success': 'Katleho',
            'common.cancel': 'Hlakola',
            'common.save': 'Boloka',
            'common.close': 'Koala',
            
            // Healthcare specific
            'healthcare.system': 'Tsamaiso ya Taolo ya Bophelo bo Botle',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Molekane wa hao ya tsheptjwang wa bophelo bo botle Afrika Borwa',
            'healthcare.professional': 'Taolo ya bophelo bo botle ya sethala bakeng sa bafani ba Afrika Borwa'
          },
          
          tn: {
            // Login page - Setswana
            'login.title': 'Re go Amogela Gape',
            'login.subtitle': 'Tsena go fitlhelela dashboard ya gago ya boitekanelo',
            'login.userId': 'ID ya Modirisi',
            'login.password': 'Phasewete',
            'login.signIn': 'Tsena',
            'login.forgotPassword': 'O lebetse Phasewete?',
            'login.createAccount': 'Tlhama Akhaonto',
            'login.demoAccounts': 'Di-akhaonto tsa Demo',
            'login.selectLanguage': 'Tlhopha Puo',
            'login.loading': 'Go tsena...',
            
            // Demo accounts
            'demo.patient': 'Akhaonto ya Molwetse',
            'demo.nurse': 'Akhaonto ya Mooki',
            'demo.doctor': 'Akhaonto ya Ngaka',
            'demo.admin': 'Akhaonto ya Motsamaisi',
            'demo.clickToFill': 'Tobetsa akhaonto epe ya demo go tlatsa ditumelo tsa go tsena go leka',
            
            // Common
            'common.welcome': 'Re go Amogela',
            'common.loading': 'Go laela...',
            'common.error': 'Phoso',
            'common.success': 'Katlego',
            'common.cancel': 'Khansela',
            'common.save': 'Boloka',
            'common.close': 'Tswala',
            
            // Healthcare specific
            'healthcare.system': 'Tsamaiso ya Taolo ya Bophelo bo Botle',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Molekane wa hao ya tshepehang wa bophelo bo botle Aforika Borwa',
            'healthcare.professional': 'Taolo ya bophelo bo botle ya semmuso bakeng sa bafani ba Aforika Borwa',
            
            // Patient Dashboard - Sesotho
            'dashboard.welcome': 'Rea u Amohela',
            'dashboard.overview': 'Mona ke kakaretso ya tlhahisoleseding ya hao ya bophelo bo botle le mesebetsi e tlang.',
            'dashboard.upcomingAppointments': 'Ditebelano tse Tlang',
            'dashboard.noUpcomingAppointments': 'Ha ho ditebelano tse tlang',
            'dashboard.viewAllAppointments': 'Sheba Ditebelano tsohle',
            'dashboard.recentTestResults': 'Diphetho tsa Diteko tsa Haufinyane',
            'dashboard.noRecentTestResults': 'Ha ho diphetho tsa diteko tsa haufinyane',
            'dashboard.viewAllResults': 'Sheba Diphetho tsohle',
            'dashboard.quickActions': 'Diketso tse Potlakileng',
            'dashboard.healthReminders': 'Dikgopotso tsa Bophelo bo Botle',
            'dashboard.medicationReminder': 'Hopola ho noa meriana ya hao ya letsatsi le letsatsi jwalo ka ha ho laetswe.',
            'dashboard.appointmentReminder': 'U na le ditebelano tse {{count}} tse tlang bekeng ena.',
            'dashboard.billReminder': 'U na le dibill tse {{count}} tse emeng tse hlokang tlhokomelo.',
            'dashboard.activeMedications': 'Meriana e Sebetsang',
            'dashboard.pendingTests': 'Diteko tse Emeng',
            'dashboard.outstandingBalance': 'Tekanyo e Setseng',
            'dashboard.healthSummary': 'Kakaretso ya Bophelo bo Botle',
            
            // Navigation - Sesotho
            'nav.patientPortal': 'Lebokose la Mokuli',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Kakaretso ya Bophelo bo Botle',
            'nav.appointments': 'Ditebelano',
            'nav.medicalRecords': 'Direkoto tsa Bongaka',
            'nav.prescriptions': 'Ditaelo tsa Meriana',
            'nav.testResults': 'Diphetho tsa Diteko',
            'nav.billing': 'Ho Lefa',
            'nav.messages': 'Melaetsa',
            'nav.profile': 'Profaele',
            'nav.settings': 'Ditlhophiso',
            'nav.logout': 'Tswa',
            
            // Quick Actions - Sesotho
            'quickActions.bookAppointment': 'Beha Tebelano',
            'quickActions.bookAppointmentDesc': 'Hlophisa tebelano e ncha le mofani wa hao wa bophelo bo botle',
            'quickActions.messages': 'Melaetsa',
            'quickActions.messagesDesc': 'Sheba le ho romela melaetsa ho sehlopha sa hao sa bophelo bo botle',
            'quickActions.testResults': 'Sheba Diphetho tsa Diteko',
            'quickActions.testResultsDesc': 'Hlahloba diphetho tsa hao tsa morao-rao tsa laboratori le dipeelo',
            'quickActions.prescriptions': 'Ditaelo tsa Meriana',
            'quickActions.prescriptionsDesc': 'Laola meriana ya hao ya hajwale le ho tlatsa hape',
            'quickActions.medicalRecords': 'Direkoto tsa Bongaka',
            'quickActions.medicalRecordsDesc': 'Fumana nalane ya hao e felletseng ya bongaka',
            'quickActions.billing': 'Ho Lefa & Ditefo',
            'quickActions.billingDesc': 'Sheba dibill le ho etsa ditefo inthaneteng'
          },
          
          ss: {
            // Login page - siSwati
            'login.title': 'Siyakwamukela Futsi',
            'login.subtitle': 'Ngena kutsi ufinyelele ku-dashboard yakho yetempilo',
            'login.userId': 'ID Yomsebentisi',
            'login.password': 'Liphasiwedi',
            'login.signIn': 'Ngena',
            'login.forgotPassword': 'Ukhohlwe Liphasiwedi?',
            'login.createAccount': 'Yakha I-akhawunti',
            'login.demoAccounts': 'Ema-akhawunti Ekubonisa',
            'login.selectLanguage': 'Khetsa Lulwimi',
            'login.loading': 'Kuyangena...',
            
            // Demo accounts
            'demo.patient': 'I-akhawunti Yesiguli',
            'demo.nurse': 'I-akhawunti Yomnesi',
            'demo.doctor': 'I-akhawunti Yodokotela',
            'demo.admin': 'I-akhawunti Yomphati',
            'demo.clickToFill': 'Chafata noma yiliphi i-akhawunti yekubonisa ngentla kutsi ugcwalise ngekuzenzekelako tincwadzi tekungena kuze kulekwe',
            
            // Common
            'common.welcome': 'Siyakwamukela',
            'common.loading': 'Kuyalayisha...',
            'common.error': 'Liphutsa',
            'common.success': 'Inhlanhla',
            'common.cancel': 'Khansela',
            'common.save': 'Gcina',
            'common.close': 'Vala',
            
            // Healthcare specific
            'healthcare.system': 'Luhlelo Lwekulawula Kwetempilo',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Umngani wakho lotetembeke wetempilo eNingizimu Afrika',
            'healthcare.professional': 'Kuphata kwetempilo kwebuchwepheshe kubahlinzeki baseNingizimu Afrika',
            
            // Patient Dashboard - siSwati
            'dashboard.welcome': 'Siyakwamukela',
            'dashboard.overview': 'Lana kuneluhlu lwetininingwane takho tetempilo kanye nemisebenti leyita.',
            'dashboard.upcomingAppointments': 'Ema-aphoyintimenti Layeta',
            'dashboard.noUpcomingAppointments': 'Awekho ema-aphoyintimenti layeta',
            'dashboard.viewAllAppointments': 'Buka Wonke Ema-aphoyintimenti',
            'dashboard.recentTestResults': 'Emiphumela Yekuhlolwa Yakamuva',
            'dashboard.noRecentTestResults': 'Ayikho imiphumela yekuhlolwa yakamuva',
            'dashboard.viewAllResults': 'Buka Yonke Imiphumela',
            'dashboard.quickActions': 'Tintfo Tekwenta Ngekushesha',
            'dashboard.healthReminders': 'Tikhumbutsi Tetempilo',
            'dashboard.medicationReminder': 'Khumbula kutsi utfole imitsi yakho yansuku tonkhe njengoba kuchaziwe.',
            'dashboard.appointmentReminder': 'Unema-aphoyintimenti la-{{count}} layeta kuleviki.',
            'dashboard.billReminder': 'Unemabhili la-{{count}} lalindze ladinga kunakwa.',
            'dashboard.activeMedications': 'Imitsi Lesebentako',
            'dashboard.pendingTests': 'Tekuhlolwa Tekulindze',
            'dashboard.outstandingBalance': 'Libhalansi Lesele',
            'dashboard.healthSummary': 'Sifinyeto Setempilo',
            
            // Navigation - siSwati
            'nav.patientPortal': 'Lisango Lesiguli',
            'nav.dashboard': 'I-Dashboard',
            'nav.healthSummary': 'Sifinyeto Setempilo',
            'nav.appointments': 'Ema-aphoyintimenti',
            'nav.medicalRecords': 'Emarekhodi Etekwelapha',
            'nav.prescriptions': 'Emaphreskiripshini',
            'nav.testResults': 'Emiphumela Yekuhlolwa',
            'nav.billing': 'Kubhayela',
            'nav.messages': 'Emiyaleto',
            'nav.profile': 'Iphrofayili',
            'nav.settings': 'Tilungiselelo',
            'nav.logout': 'Phuma',
            
            // Quick Actions - siSwati
            'quickActions.bookAppointment': 'Bhuka I-aphoyintimenti',
            'quickActions.bookAppointmentDesc': 'Hlela i-aphoyintimenti lesha lomnikati wakho wetempilo',
            'quickActions.messages': 'Emiyaleto',
            'quickActions.messagesDesc': 'Buka futsi utfumele emiyaleto kulikhongolose lakho letempilo',
            'quickActions.testResults': 'Buka Emiphumela Yekuhlolwa',
            'quickActions.testResultsDesc': 'Hlola emiphumela yakho yakamuva yaselabhoratori nemibiko',
            'quickActions.prescriptions': 'Emaphreskiripshini',
            'quickActions.prescriptionsDesc': 'Phata imitsi yakho yamanje nekugcwalisa kabusha',
            'quickActions.medicalRecords': 'Emarekhodi Etekwelapha',
            'quickActions.medicalRecordsDesc': 'Finyelela kumlando wakho lophelele wetekwelapha',
            'quickActions.billing': 'Kubhayela & Tinkhokelo',
            'quickActions.billingDesc': 'Buka emabhili futsi wente tinkhokelo ku-inthanethi'
          },
          
          nr: {
            // Login page - isiNdebele
            'login.title': 'Siyakwamukela Futhi',
            'login.subtitle': 'Ngena ukuze ufinyelele ku-dashboard yakho yempilo',
            'login.userId': 'I-ID Yomsebenzisi',
            'login.password': 'Iphasiwedi',
            'login.signIn': 'Ngena',
            'login.forgotPassword': 'Ukhohlwe Iphasiwedi?',
            'login.createAccount': 'Yakha I-akhawunti',
            'login.demoAccounts': 'Ama-akhawunti Okubonisa',
            'login.selectLanguage': 'Khetha Ulimi',
            'login.loading': 'Kuyangena...',
            
            // Demo accounts
            'demo.patient': 'I-akhawunti Yesiguli',
            'demo.nurse': 'I-akhawunti Yomnesi',
            'demo.doctor': 'I-akhawunti Yodokotela',
            'demo.admin': 'I-akhawunti Yomphathi',
            'demo.clickToFill': 'Chofoza noma yiliphi i-akhawunti yokubonisa ngenhla ukugcwalisa ngokuzenzakalela izincwadi zokungena ukuze uhlole',
            
            // Common
            'common.welcome': 'Siyakwamukela',
            'common.loading': 'Kuyalayisha...',
            'common.error': 'Iphutha',
            'common.success': 'Impumelelo',
            'common.cancel': 'Khansela',
            'common.save': 'Gcina',
            'common.close': 'Vala',
            
            // Healthcare specific
            'healthcare.system': 'Uhlelo Lokuphatha Impilo',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Umngani wakho othembekile wempilo eNingizimu Afrika',
            'healthcare.professional': 'Ukuphatha impilo kochwepheshe kubahlinzeki baseNingizimu Afrika'
          },
          
          ts: {
            // Login page - Xitsonga
            'login.title': 'Hi ku Amukela Nakambe',
            'login.subtitle': 'Ngena leswaku u nga fikelela eka dashboard ya wena ya rihanyu',
            'login.userId': 'ID ya Mutirhisi',
            'login.password': 'Phasiwedi',
            'login.signIn': 'Ngena',
            'login.forgotPassword': 'U rivele Phasiwedi?',
            'login.createAccount': 'Tumbuluxa Akhawunti',
            'login.demoAccounts': 'Tiakhawunti ta Demo',
            'login.selectLanguage': 'Hlawula Ririmi',
            'login.loading': 'Ku ya ngena...',
            
            // Demo accounts
            'demo.patient': 'Akhawunti ya Munhu loyi a lwalisaka',
            'demo.nurse': 'Akhawunti ya Muongori',
            'demo.doctor': 'Akhawunti ya Dokodela',
            'demo.admin': 'Akhawunti ya Mulawuri',
            'demo.clickToFill': 'Tirhisa akhawunti yihi na ya demo laha henhla leswaku u tata hi ku tirhela swikombiso swa ku ngena ku kambela',
            
            // Common
            'common.welcome': 'Hi ku Amukela',
            'common.loading': 'Ku ya layisha...',
            'common.error': 'Xihoxo',
            'common.success': 'Ku humelela',
            'common.cancel': 'Herisa',
            'common.save': 'Hlayisa',
            'common.edit': 'Lulamisa',
            'common.delete': 'Susa',
            'common.view': 'Vona',
            'common.close': 'Pfala',
            
            // Healthcare specific
            'healthcare.system': 'Sisiteme sa Vulawuri bya Rihanyu',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Munghana wa wena loyi a tshembhekaka wa rihanyu eAfrika Dzonga',
            'healthcare.professional': 'Vulawuri bya rihanyu bya xiphurofexinali eka varhangeri va Afrika Dzonga',
            
            // Patient Dashboard - Xitsonga
            'dashboard.welcome': 'Hi ku Amukela',
            'dashboard.overview': 'Laha i nkatsakanyo wa rungula ra wena ra rihanyu na mintirho leyi taka.',
            'dashboard.upcomingAppointments': 'Swivumbeko leswi taka',
            'dashboard.noUpcomingAppointments': 'Ku hava swivumbeko leswi taka',
            'dashboard.viewAllAppointments': 'Vona Swivumbeko hinkwaswo',
            'dashboard.recentTestResults': 'Mbuyelo wa Swikambelo swa Sweswi',
            'dashboard.noRecentTestResults': 'Ku hava mbuyelo wa swikambelo swa sweswi',
            'dashboard.viewAllResults': 'Vona Mbuyelo hinkwawo',
            'dashboard.quickActions': 'Swiendlo swa Xihatla',
            'dashboard.healthReminders': 'Swikhumbuxi swa Rihanyu',
            'dashboard.medicationReminder': 'Tsundzuka ku teka mirhi ya wena ya siku rin\'wana na rin\'wana tanihi leswi u boxiweke.',
            'dashboard.appointmentReminder': 'U na swivumbeko swa {{count}} leswi taka evhikini leri.',
            'dashboard.billReminder': 'U na tibhili ta {{count}} leti rindzeleke leti lavaka ku tekeriwa.',
            'dashboard.activeMedications': 'Mirhi leyi Tirhaka',
            'dashboard.pendingTests': 'Swikambelo leswi Rindzeleke',
            'dashboard.outstandingBalance': 'Nxavo lowu Saleke',
            'dashboard.healthSummary': 'Nkatsakanyo wa Rihanyu',
            
            // Navigation - Xitsonga
            'nav.patientPortal': 'Mango wa Munhu loyi a lwalisaka',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Nkatsakanyo wa Rihanyu',
            'nav.appointments': 'Swivumbeko',
            'nav.medicalRecords': 'Tirekoto ta Vurhi',
            'nav.prescriptions': 'Swileriso swa Mirhi',
            'nav.testResults': 'Mbuyelo wa Swikambelo',
            'nav.billing': 'Ku Hakela',
            'nav.messages': 'Marungula',
            'nav.profile': 'Profayili',
            'nav.settings': 'Swiyimiso',
            'nav.logout': 'Huma',
            
            // Quick Actions - Xitsonga
            'quickActions.bookAppointment': 'Buka Xivumbeko',
            'quickActions.bookAppointmentDesc': 'Lulamisa xivumbeko lexintshwa na mufaki wa wena wa rihanyu',
            'quickActions.messages': 'Marungula',
            'quickActions.messagesDesc': 'Vona na ku rhumela marungula eka ntlawa wa wena wa rihanyu',
            'quickActions.testResults': 'Vona Mbuyelo wa Swikambelo',
            'quickActions.testResultsDesc': 'Kambela mbuyelo wa wena wa sweswi wa laboratori na swiviko',
            'quickActions.prescriptions': 'Swileriso swa Mirhi',
            'quickActions.prescriptionsDesc': 'Lawula mirhi ya wena ya sweswi na ku tlakusa nakambe',
            'quickActions.medicalRecords': 'Tirekoto ta Vurhi',
            'quickActions.medicalRecordsDesc': 'Fikelela eka matimu ya wena yo helela ya vurhi',
            'quickActions.billing': 'Ku Hakela & Swihakelo',
            'quickActions.billingDesc': 'Vona tibhili na ku endla swihakelo eka inthanete'
          },
          
          ve: {
            // Login page - Tshivenḓa
            'login.title': 'Ri a vha Amukela Hafhu',
            'login.subtitle': 'Pindani uri vha swikelelele kha dashboard yavho ya vhuhulwane',
            'login.userId': 'ID ya Mushumisi',
            'login.password': 'Phasiwedi',
            'login.signIn': 'Pindani',
            'login.forgotPassword': 'Vho livhuwa nga Phasiwedi?',
            'login.createAccount': 'Vhumbani Akhaonto',
            'login.demoAccounts': 'Zwiakhaonto zwa Demo',
            'login.selectLanguage': 'Nangani Luambo',
            'login.loading': 'Zwo ya pinda...',
            
            // Demo accounts
            'demo.patient': 'Akhaonto ya Mulwadze',
            'demo.nurse': 'Akhaonto ya Muongamisi',
            'demo.doctor': 'Akhaonto ya Dokotela',
            'demo.admin': 'Akhaonto ya Mulanguli',
            'demo.clickToFill': 'Dzhidzani akhaonto iṅwe na iṅwe ya demo afho ntha uri vha dzhenisele nga vhune zwiga zwa u pinda kha u linga',
            
            // Common
            'common.welcome': 'Ri a vha Amukela',
            'common.loading': 'Zwo ya takadza...',
            'common.error': 'Phosho',
            'common.success': 'Kushumele',
            'common.cancel': 'Khansela',
            'common.save': 'Chengetedzani',
            'common.close': 'Valani',
            
            // Healthcare specific
            'healthcare.system': 'Maitele a u Langula Vhuhulwane',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Khongolose yavho ya u tshemba ya vhuhulwane kha Afrika Tshipembe',
            'healthcare.professional': 'U langula vhuhulwane ha vhuprofeshenali kha vhafhasi vha Afrika Tshipembe'
          },
          
          nso: {
            // Login page - Sepedi
            'login.title': 'Re go Amogela Gape',
            'login.subtitle': 'Tsena go fihlela dashboard ya gago ya maphelo',
            'login.userId': 'ID ya Modiriši',
            'login.password': 'Phasewete',
            'login.signIn': 'Tsena',
            'login.forgotPassword': 'O lebetše Phasewete?',
            'login.createAccount': 'Hlola Akhaonto',
            'login.demoAccounts': 'Di-akhaonto tša Demo',
            'login.selectLanguage': 'Kgetha Polelo',
            'login.loading': 'Go tsena...',
            
            // Demo accounts
            'demo.patient': 'Akhaonto ya Molwetši',
            'demo.nurse': 'Akhaonto ya Mooki',
            'demo.doctor': 'Akhaonto ya Ngaka',
            'demo.admin': 'Akhaonto ya Motsamaiši',
            'demo.clickToFill': 'Tobetša akhaonto efe goba efe ya demo ka godimo go tlatša ka go itirela ditumelo tša go tsena go leka',
            
            // Common
            'common.welcome': 'Re go Amogela',
            'common.loading': 'Go laela...',
            'common.error': 'Phošo',
            'common.success': 'Katlego',
            'common.cancel': 'Khansela',
            'common.save': 'Boloka',
            'common.close': 'Tswalela',
            
            // Healthcare specific
            'healthcare.system': 'Tshepedišo ya Taolo ya Maphelo',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Molekane wa gago yo o tšhepegago wa maphelo ka Afrika Borwa',
            'healthcare.professional': 'Taolo ya maphelo ya seporofešenale go bafani ba Afrika Borwa',
            
            // Patient Dashboard - Tshivenḓa
            'dashboard.welcome': 'Ri a vha Amukela',
            'dashboard.overview': 'Hoyu ndi muhumbulo wa zwidodombedzwa zwavho zwa vhuhulwane na mishumo ye ya u da.',
            'dashboard.upcomingAppointments': 'Zwiapoinitimenti zwe zwa da',
            'dashboard.noUpcomingAppointments': 'A huna zwiapoinitimenti zwe zwa da',
            'dashboard.viewAllAppointments': 'Vonani Zwiapoinitimenti Zwothe',
            'dashboard.recentTestResults': 'Mvelelo dza Mulingo dza Zwino',
            'dashboard.noRecentTestResults': 'A huna mvelelo dza mulingo dza zwino',
            'dashboard.viewAllResults': 'Vonani Mvelelo Dzothe',
            'dashboard.quickActions': 'Zwito zwa u Tavhanya',
            'dashboard.healthReminders': 'Zwikhumbulusi zwa Vhuhulwane',
            'dashboard.medicationReminder': 'Khumbulani u nwa mishonga yavho ya duvha ḽiṅwe na ḽiṅwe sa zwe zwa ṱalutshedzwa.',
            'dashboard.appointmentReminder': 'Vhi na zwiapoinitimenti {{count}} zwe zwa da vhigini heli.',
            'dashboard.billReminder': 'Vhi na mabili {{count}} a re lindaho ane a toda u dzhiiwa.',
            'dashboard.activeMedications': 'Mishonga ye ya Shuma',
            'dashboard.pendingTests': 'Mulingo u re Lindaho',
            'dashboard.outstandingBalance': 'Tshikolodo tshi re hone',
            'dashboard.healthSummary': 'Muhumbulo wa Vhuhulwane',
            
            // Navigation - Tshivenḓa
            'nav.patientPortal': 'Tshivhangano tsha Mulwadze',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Muhumbulo wa Vhuhulwane',
            'nav.appointments': 'Zwiapoinitimenti',
            'nav.medicalRecords': 'Rekodo dza Vhubvumisi',
            'nav.prescriptions': 'Zwiṱalutshedzwa',
            'nav.testResults': 'Mvelelo dza Mulingo',
            'nav.billing': 'U Badelela',
            'nav.messages': 'Melaedza',
            'nav.profile': 'Profaele',
            'nav.settings': 'Zwiṱuṱuwedzo',
            'nav.logout': 'Bvani',
            
            // Quick Actions - Tshivenḓa
            'quickActions.bookAppointment': 'Ṅwalani Apoinitimenti',
            'quickActions.bookAppointmentDesc': 'Dzudzanyani apoinitimenti nnsha na mufhasi wavho wa vhuhulwane',
            'quickActions.messages': 'Melaedza',
            'quickActions.messagesDesc': 'Vonani na u rumela melaedza kha tshigwada tshavho tsha vhuhulwane',
            'quickActions.testResults': 'Vonani Mvelelo dza Mulingo',
            'quickActions.testResultsDesc': 'Sedzani mvelelo dzavho dza zwino dza laboratori na mibvumiso',
            'quickActions.prescriptions': 'Zwiṱalutshedzwa',
            'quickActions.prescriptionsDesc': 'Khwaṱhisedzani mishonga yavho ya zwino na u dzhenisa hafhu',
            'quickActions.medicalRecords': 'Rekodo dza Vhubvumisi',
            'quickActions.medicalRecordsDesc': 'Swikelani kha mbalelo yavho yo fhelelaho ya vhubvumisi',
            'quickActions.billing': 'U Badelela & Mabadelo',
            'quickActions.billingDesc': 'Vonani mabili na u ita mabadelo kha inthanete'
          },
          
          tn: {
            // Login page - Setswana
            'login.title': 'Re go Amogela Gape',
            'login.subtitle': 'Tsena go fitlhelela dashboard ya gago ya boitekanelo',
            'login.userId': 'ID ya Modirisi',
            'login.password': 'Phasewete',
            'login.signIn': 'Tsena',
            'login.forgotPassword': 'O lebetse Phasewete?',
            'login.createAccount': 'Tlhama Akhaonto',
            'login.demoAccounts': 'Di-akhaonto tsa Demo',
            'login.selectLanguage': 'Tlhopha Puo',
            'login.loading': 'Go tsena...',
            
            // Demo accounts
            'demo.patient': 'Akhaonto ya Molwetse',
            'demo.nurse': 'Akhaonto ya Mooki',
            'demo.doctor': 'Akhaonto ya Ngaka',
            'demo.admin': 'Akhaonto ya Motsamaisi',
            'demo.clickToFill': 'Tobetsa akhaonto epe ya demo fa godimo go tlatsa ka boithaopi ditumelo tsa go tsena go leka',
            
            // Common
            'common.welcome': 'Re go Amogela',
            'common.loading': 'Go laela...',
            'common.error': 'Phoso',
            'common.success': 'Katlego',
            'common.cancel': 'Khansela',
            'common.save': 'Boloka',
            'common.edit': 'Baakanya',
            'common.delete': 'Phimola',
            'common.view': 'Bona',
            'common.close': 'Tswala',
            
            // Healthcare specific
            'healthcare.system': 'Thulaganyo ya Taolo ya Boitekanelo',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Molekane wa gago yo o ikanyegang wa boitekanelo mo Aforika Borwa',
            'healthcare.professional': 'Taolo ya boitekanelo ya seporofešenale ya bafani ba Aforika Borwa',
            
            // Patient Dashboard - Setswana
            'dashboard.welcome': 'Re go Amogela',
            'dashboard.overview': 'Fano ke kakaretso ya tshedimosetso ya gago ya boitekanelo le ditiro tse di tlang.',
            'dashboard.upcomingAppointments': 'Ditebelano tse di Tlang',
            'dashboard.noUpcomingAppointments': 'Ga go na ditebelano tse di tlang',
            'dashboard.viewAllAppointments': 'Bona Ditebelano Tsotlhe',
            'dashboard.recentTestResults': 'Dipoelo tsa Diteko tsa Bosheng',
            'dashboard.noRecentTestResults': 'Ga go na dipoelo tsa diteko tsa bosheng',
            'dashboard.viewAllResults': 'Bona Dipoelo Tsotlhe',
            'dashboard.quickActions': 'Ditiro tse di Bonako',
            'dashboard.healthReminders': 'Dikgopotso tsa Boitekanelo',
            'dashboard.medicationReminder': 'Gakologelwa go tsaya diritibatsi tsa gago tsa letsatsi le letsatsi jaaka go laetswe.',
            'dashboard.appointmentReminder': 'O na le ditebelano di le {{count}} tse di tlang mo bekeng eno.',
            'dashboard.billReminder': 'O na le dibill di le {{count}} tse di emetseng tse di tlhokang tlhokomelo.',
            'dashboard.activeMedications': 'Diritibatsi tse di Dirang',
            'dashboard.pendingTests': 'Diteko tse di Emetse',
            'dashboard.outstandingBalance': 'Tekanyo e e Saleng',
            'dashboard.healthSummary': 'Kakaretso ya Boitekanelo',
            
            // Navigation - Setswana
            'nav.patientPortal': 'Kgoro ya Molwetse',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Kakaretso ya Boitekanelo',
            'nav.appointments': 'Ditebelano',
            'nav.medicalRecords': 'Direkoto tsa Kalafi',
            'nav.prescriptions': 'Ditaelo tsa Diritibatsi',
            'nav.testResults': 'Dipoelo tsa Diteko',
            'nav.billing': 'Go Duela',
            'nav.messages': 'Melaetsa',
            'nav.profile': 'Profaele',
            'nav.settings': 'Dithulaganyo',
            'nav.logout': 'Tswa',
            
            // Quick Actions - Setswana
            'quickActions.bookAppointment': 'Beela Tebelano',
            'quickActions.bookAppointmentDesc': 'Rulaganya tebelano e ntšhwa le mofani wa gago wa boitekanelo',
            'quickActions.messages': 'Melaetsa',
            'quickActions.messagesDesc': 'Bona le go romela melaetsa mo setlhopheng sa gago sa boitekanelo',
            'quickActions.testResults': 'Bona Dipoelo tsa Diteko',
            'quickActions.testResultsDesc': 'Tlhatlhoba dipoelo tsa gago tsa bosheng tsa laboratori le dipego',
            'quickActions.prescriptions': 'Ditaelo tsa Diritibatsi',
            'quickActions.prescriptionsDesc': 'Laola diritibatsi tsa gago tsa jaanong le go tlatsa gape',
            'quickActions.medicalRecords': 'Direkoto tsa Kalafi',
            'quickActions.medicalRecordsDesc': 'Fitlhelela nalane ya gago e e feletseng ya kalafi',
            'quickActions.billing': 'Go Duela & Dituelo',
            'quickActions.billingDesc': 'Bona dibill le go dira dituelo mo internet'
          },
          
          ts: {
            // Login page - Xitsonga
            'login.title': 'Hi ku Amukela Nakambe',
            'login.subtitle': 'Ngena leswaku u nga fikelela eka dashboard ya wena ya rihanyu',
            'login.userId': 'ID ya Mutirhisi',
            'login.password': 'Phasiwedi',
            'login.signIn': 'Ngena',
            'login.forgotPassword': 'U rivele Phasiwedi?',
            'login.createAccount': 'Tumbuluxa Akhawunti',
            'login.demoAccounts': 'Tiakhawunti ta Demo',
            'login.selectLanguage': 'Hlawula Ririmi',
            'login.loading': 'Ku ya ngena...',
            
            // Demo accounts
            'demo.patient': 'Akhawunti ya Munhu loyi a lwalisaka',
            'demo.nurse': 'Akhawunti ya Muongori',
            'demo.doctor': 'Akhawunti ya Dokodela',
            'demo.admin': 'Akhawunti ya Mulawuri',
            'demo.clickToFill': 'Tirhisa akhawunti yihi na ya demo laha henhla leswaku u tata hi ku tirhela swikombiso swa ku ngena ku kambela',
            
            // Common
            'common.welcome': 'Hi ku Amukela',
            'common.loading': 'Ku ya layisha...',
            'common.error': 'Xihoxo',
            'common.success': 'Ku humelela',
            'common.cancel': 'Herisa',
            'common.save': 'Hlayisa',
            'common.edit': 'Lulamisa',
            'common.delete': 'Susa',
            'common.view': 'Vona',
            'common.close': 'Pfala',
            
            // Healthcare specific
            'healthcare.system': 'Sisiteme sa Vulawuri bya Rihanyu',
            'healthcare.mediconnect': 'MediConnect',
            'healthcare.tagline': 'Munghana wa wena loyi a tshembhekaka wa rihanyu eAfrika Dzonga',
            'healthcare.professional': 'Vulawuri bya rihanyu bya xiphurofexinali eka varhangeri va Afrika Dzonga',
            
            // Patient Dashboard - Xitsonga
            'dashboard.welcome': 'Hi ku Amukela',
            'dashboard.overview': 'Laha i nkatsakanyo wa rungula ra wena ra rihanyu na mintirho leyi taka.',
            'dashboard.upcomingAppointments': 'Swivumbeko leswi taka',
            'dashboard.noUpcomingAppointments': 'Ku hava swivumbeko leswi taka',
            'dashboard.viewAllAppointments': 'Vona Swivumbeko hinkwaswo',
            'dashboard.recentTestResults': 'Mbuyelo wa Swikambelo swa Sweswi',
            'dashboard.noRecentTestResults': 'Ku hava mbuyelo wa swikambelo swa sweswi',
            'dashboard.viewAllResults': 'Vona Mbuyelo hinkwawo',
            'dashboard.quickActions': 'Swiendlo swa Xihatla',
            'dashboard.healthReminders': 'Swikhumbuxi swa Rihanyu',
            'dashboard.medicationReminder': 'Tsundzuka ku teka mirhi ya wena ya siku rin\'wana na rin\'wana tanihi leswi u boxiweke.',
            'dashboard.appointmentReminder': 'U na swivumbeko swa {{count}} leswi taka evhikini leri.',
            'dashboard.billReminder': 'U na tibhili ta {{count}} leti rindzeleke leti lavaka ku tekeriwa.',
            'dashboard.activeMedications': 'Mirhi leyi Tirhaka',
            'dashboard.pendingTests': 'Swikambelo leswi Rindzeleke',
            'dashboard.outstandingBalance': 'Nxavo lowu Saleke',
            'dashboard.healthSummary': 'Nkatsakanyo wa Rihanyu',
            
            // Navigation - Xitsonga
            'nav.patientPortal': 'Mango wa Munhu loyi a lwalisaka',
            'nav.dashboard': 'Dashboard',
            'nav.healthSummary': 'Nkatsakanyo wa Rihanyu',
            'nav.appointments': 'Swivumbeko',
            'nav.medicalRecords': 'Tirekoto ta Vurhi',
            'nav.prescriptions': 'Swileriso swa Mirhi',
            'nav.testResults': 'Mbuyelo wa Swikambelo',
            'nav.billing': 'Ku Hakela',
            'nav.messages': 'Marungula',
            'nav.profile': 'Profayili',
            'nav.settings': 'Swiyimiso',
            'nav.logout': 'Huma',
            
            // Quick Actions - Xitsonga
            'quickActions.bookAppointment': 'Buka Xivumbeko',
            'quickActions.bookAppointmentDesc': 'Lulamisa xivumbeko lexintshwa na mufaki wa wena wa rihanyu',
            'quickActions.messages': 'Marungula',
            'quickActions.messagesDesc': 'Vona na ku rhumela marungula eka ntlawa wa wena wa rihanyu',
            'quickActions.testResults': 'Vona Mbuyelo wa Swikambelo',
            'quickActions.testResultsDesc': 'Kambela mbuyelo wa wena wa sweswi wa laboratori na swiviko',
            'quickActions.prescriptions': 'Swileriso swa Mirhi',
            'quickActions.prescriptionsDesc': 'Lawula mirhi ya wena ya sweswi na ku tlakusa nakambe',
            'quickActions.medicalRecords': 'Tirekoto ta Vurhi',
            'quickActions.medicalRecordsDesc': 'Fikelela eka matimu ya wena yo helela ya vurhi',
            'quickActions.billing': 'Ku Hakela & Swihakelo',
            'quickActions.billingDesc': 'Vona tibhili na ku endla swihakelo eka inthanete'
          }
        };
        
        setTranslations(allTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, []);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages: LANGUAGES,
    isRTL: false // None of SA languages are RTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
