// Comprehensive list of South African hospitals and clinics by province
const southAfricanFacilities = [
  // Gauteng Province
  {
    name: "Chris Hani Baragwanath Hospital",
    type: "HOSPITAL",
    address: "Chris Hani Road, Diepkloof, Soweto, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "CHBH"
  },
  {
    name: "Johannesburg General Hospital",
    type: "HOSPITAL",
    address: "Jubilee Road, Parktown, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "JHBH"
  },
  {
    name: "Steve Biko Academic Hospital",
    type: "HOSPITAL",
    address: "Cnr Malherbe and Steve Biko Streets, Prinshof, Pretoria",
    province: "Gauteng",
    district: "Tshwane",
    code: "SBAH"
  },
  {
    name: "Pretoria Academic Hospital",
    type: "HOSPITAL",
    address: "Dr Savage Road, Pretoria",
    province: "Gauteng",
    district: "Tshwane",
    code: "PAH"
  },
  {
    name: "Helen Joseph Hospital",
    type: "HOSPITAL",
    address: "Perth Road, Westdene, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "HJH"
  },
  {
    name: "Charlotte Maxeke Johannesburg Academic Hospital",
    type: "HOSPITAL",
    address: "Jubilee Road, Parktown, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "CMJAH"
  },
  {
    name: "Tembisa Hospital",
    type: "HOSPITAL",
    address: "Cnr Flint Mazibuko and Rev RTJ Namane Drive, Tembisa",
    province: "Gauteng",
    district: "Ekurhuleni",
    code: "TH"
  },
  {
    name: "Edenvale Hospital",
    type: "HOSPITAL",
    address: "32nd Avenue, Edenvale",
    province: "Gauteng",
    district: "Ekurhuleni",
    code: "EH"
  },
  {
    name: "Germiston Hospital",
    type: "HOSPITAL",
    address: "Cnr Odendaal and Rand Streets, Germiston",
    province: "Gauteng",
    district: "Ekurhuleni",
    code: "GH"
  },
  {
    name: "Sebokeng Hospital",
    type: "HOSPITAL",
    address: "Moshoeshoe Street, Sebokeng",
    province: "Gauteng",
    district: "Sedibeng",
    code: "SH"
  },

  // Western Cape Province
  {
    name: "Groote Schuur Hospital",
    type: "HOSPITAL",
    address: "Main Road, Observatory, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "GSH"
  },
  {
    name: "Tygerberg Hospital",
    type: "HOSPITAL",
    address: "Francie van Zijl Drive, Tygerberg, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "TBH"
  },
  {
    name: "Red Cross War Memorial Children's Hospital",
    type: "HOSPITAL",
    address: "Klipfontein Road, Rondebosch, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "RCWMCH"
  },
  {
    name: "New Somerset Hospital",
    type: "HOSPITAL",
    address: "Beach Road, Green Point, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "NSH"
  },
  {
    name: "Victoria Hospital",
    type: "HOSPITAL",
    address: "Alphen Hill Road, Wynberg, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "VH"
  },
  {
    name: "Mitchells Plain Hospital",
    type: "HOSPITAL",
    address: "AZ Berman Drive, Mitchells Plain, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "MPH"
  },
  {
    name: "Karl Bremer Hospital",
    type: "HOSPITAL",
    address: "Cnr Mike Pienaar Boulevard and Frans Conradie Drive, Bellville",
    province: "Western Cape",
    district: "Cape Town",
    code: "KBH"
  },

  // KwaZulu-Natal Province
  {
    name: "Inkosi Albert Luthuli Central Hospital",
    type: "HOSPITAL",
    address: "Cnr King Dinuzulu Hospital and Bellair Roads, Mayville, Durban",
    province: "KwaZulu-Natal",
    district: "eThekwini",
    code: "IALCH"
  },
  {
    name: "King Edward VIII Hospital",
    type: "HOSPITAL",
    address: "Cnr Sydney and Rick Turner Roads, Congella, Durban",
    province: "KwaZulu-Natal",
    district: "eThekwini",
    code: "KEH"
  },
  {
    name: "Addington Hospital",
    type: "HOSPITAL",
    address: "Erskine Terrace, South Beach, Durban",
    province: "KwaZulu-Natal",
    district: "eThekwini",
    code: "AH"
  },
  {
    name: "St Aidans Hospital",
    type: "HOSPITAL",
    address: "Cnr Vusi Mzimela and South Beach Roads, Durban",
    province: "KwaZulu-Natal",
    district: "eThekwini",
    code: "SAH"
  },
  {
    name: "Prince Mshiyeni Memorial Hospital",
    type: "HOSPITAL",
    address: "Griffiths Mxenge Highway, Umlazi, Durban",
    province: "KwaZulu-Natal",
    district: "eThekwini",
    code: "PMMH"
  },
  {
    name: "Ngwelezana Hospital",
    type: "HOSPITAL",
    address: "Private Bag X20005, Empangeni",
    province: "KwaZulu-Natal",
    district: "King Cetshwayo",
    code: "NH"
  },
  {
    name: "Port Shepstone Hospital",
    type: "HOSPITAL",
    address: "18 Bazley Street, Port Shepstone",
    province: "KwaZulu-Natal",
    district: "Ugu",
    code: "PSH"
  },

  // Eastern Cape Province
  {
    name: "Livingstone Hospital",
    type: "HOSPITAL",
    address: "Stanford Road, Korsten, Port Elizabeth",
    province: "Eastern Cape",
    district: "Nelson Mandela Bay",
    code: "LH"
  },
  {
    name: "Dora Nginza Hospital",
    type: "HOSPITAL",
    address: "Spondo Street, Zwide, Port Elizabeth",
    province: "Eastern Cape",
    district: "Nelson Mandela Bay",
    code: "DNH"
  },
  {
    name: "Uitenhage Hospital",
    type: "HOSPITAL",
    address: "Cnr Caledon and Mitchell Streets, Uitenhage",
    province: "Eastern Cape",
    district: "Nelson Mandela Bay",
    code: "UH"
  },
  {
    name: "Frere Hospital",
    type: "HOSPITAL",
    address: "Amalinda Main Road, East London",
    province: "Eastern Cape",
    district: "Buffalo City",
    code: "FH"
  },
  {
    name: "Cecilia Makiwane Hospital",
    type: "HOSPITAL",
    address: "Cnr Komani and Owen Streets, Mdantsane, East London",
    province: "Eastern Cape",
    district: "Buffalo City",
    code: "CMH"
  },
  {
    name: "Nelson Mandela Academic Hospital",
    type: "HOSPITAL",
    address: "Sisson Street, Mthatha",
    province: "Eastern Cape",
    district: "OR Tambo",
    code: "NMAH"
  },

  // Limpopo Province
  {
    name: "Polokwane Hospital",
    type: "HOSPITAL",
    address: "Cnr Dorp and Hospital Streets, Polokwane",
    province: "Limpopo",
    district: "Capricorn",
    code: "PH"
  },
  {
    name: "Mankweng Hospital",
    type: "HOSPITAL",
    address: "Sovenga Road, Mankweng",
    province: "Limpopo",
    district: "Capricorn",
    code: "MH"
  },
  {
    name: "Pietersburg Hospital",
    type: "HOSPITAL",
    address: "Cnr Thabo Mbeki and Suid Streets, Polokwane",
    province: "Limpopo",
    district: "Capricorn",
    code: "PiH"
  },
  {
    name: "Tshilidzini Hospital",
    type: "HOSPITAL",
    address: "Hospital Street, Shayandima, Thohoyandou",
    province: "Limpopo",
    district: "Vhembe",
    code: "TH"
  },

  // Mpumalanga Province
  {
    name: "Rob Ferreira Hospital",
    type: "HOSPITAL",
    address: "Madiba Drive, West Acres, Mbombela",
    province: "Mpumalanga",
    district: "Ehlanzeni",
    code: "RFH"
  },
  {
    name: "Themba Hospital",
    type: "HOSPITAL",
    address: "KaBokweni, Mbombela",
    province: "Mpumalanga",
    district: "Ehlanzeni",
    code: "TH"
  },
  {
    name: "Witbank Hospital",
    type: "HOSPITAL",
    address: "Cnr OR Tambo and Beatty Avenue, Witbank",
    province: "Mpumalanga",
    district: "Nkangala",
    code: "WH"
  },

  // North West Province
  {
    name: "Klerksdorp/Tshepong Hospital",
    type: "HOSPITAL",
    address: "Cnr Klerk and OR Tambo Streets, Klerksdorp",
    province: "North West",
    district: "Dr Kenneth Kaunda",
    code: "KTH"
  },
  {
    name: "Rustenburg Hospital",
    type: "HOSPITAL",
    address: "Cnr Heystek and Brink Streets, Rustenburg",
    province: "North West",
    district: "Bojanala Platinum",
    code: "RH"
  },
  {
    name: "Mafikeng Hospital",
    type: "HOSPITAL",
    address: "Cnr Sekame and Martin Streets, Mahikeng",
    province: "North West",
    district: "Ngaka Modiri Molema",
    code: "MH"
  },

  // Northern Cape Province
  {
    name: "Kimberley Hospital",
    type: "HOSPITAL",
    address: "Cnr Warren and Ryneveld Streets, Kimberley",
    province: "Northern Cape",
    district: "Frances Baard",
    code: "KH"
  },
  {
    name: "Robert Mangaliso Sobukwe Hospital",
    type: "HOSPITAL",
    address: "Cnr Schmidtsdrift and Quinn Streets, Kimberley",
    province: "Northern Cape",
    district: "Frances Baard",
    code: "RMSH"
  },

  // Free State Province
  {
    name: "Pelonomi Hospital",
    type: "HOSPITAL",
    address: "Cnr Dr Belcher and Douglas Roads, Bloemfontein",
    province: "Free State",
    district: "Mangaung",
    code: "PH"
  },
  {
    name: "Universitas Hospital",
    type: "HOSPITAL",
    address: "Cnr Logeman and Roth Avenue, Bloemfontein",
    province: "Free State",
    district: "Mangaung",
    code: "UH"
  },
  {
    name: "National Hospital",
    type: "HOSPITAL",
    address: "Cnr Nelson Mandela Drive and DF Malherbe Avenue, Bloemfontein",
    province: "Free State",
    district: "Mangaung",
    code: "NH"
  },

  // Major Private Hospitals
  {
    name: "Netcare Christiaan Barnard Memorial Hospital",
    type: "HOSPITAL",
    address: "181 Longmarket Street, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "NCBMH"
  },
  {
    name: "Netcare Milpark Hospital",
    type: "HOSPITAL",
    address: "9 Guild Road, Parktown West, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "NMH"
  },
  {
    name: "Netcare Sunninghill Hospital",
    type: "HOSPITAL",
    address: "Cnr Witkoppen and Nanyuki Roads, Sunninghill, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "NSH"
  },
  {
    name: "Mediclinic Cape Town",
    type: "HOSPITAL",
    address: "21 Hof Street, Gardens, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "MCCT"
  },
  {
    name: "Life Healthcare Kingsbury Hospital",
    type: "HOSPITAL",
    address: "Cnr Wilderness and North Roads, Claremont, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "LHKH"
  },

  // Major Clinics and Community Health Centers
  {
    name: "Alexandra Community Health Centre",
    type: "CLINIC",
    address: "Cnr Selbourne and Roosevelt Streets, Alexandra, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "ACHC"
  },
  {
    name: "Hillbrow Community Health Centre",
    type: "CLINIC",
    address: "Esselen Street, Hillbrow, Johannesburg",
    province: "Gauteng",
    district: "Johannesburg",
    code: "HCHC"
  },
  {
    name: "Mitchells Plain Community Health Centre",
    type: "CLINIC",
    address: "AZ Berman Drive, Mitchells Plain, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "MPCHC"
  },
  {
    name: "Khayelitsha Community Health Centre",
    type: "CLINIC",
    address: "Cnr Steve Biko and Walter Sisulu Roads, Khayelitsha, Cape Town",
    province: "Western Cape",
    district: "Cape Town",
    code: "KCHC"
  },
  {
    name: "Durban Central Community Health Centre",
    type: "CLINIC",
    address: "Cnr Prince Edward and Cathedral Roads, Durban",
    province: "KwaZulu-Natal",
    district: "eThekwini",
    code: "DCCHC"
  }
];

module.exports = southAfricanFacilities;
