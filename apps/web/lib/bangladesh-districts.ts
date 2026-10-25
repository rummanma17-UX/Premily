export type DistrictDefinition = {
  name: string;
  division: string;
  isDhakaDivision: boolean;
};

export const BANGLADESH_DISTRICTS: DistrictDefinition[] = [
  // Dhaka Division
  { name: "Dhaka", division: "Dhaka", isDhakaDivision: true },
  { name: "Gazipur", division: "Dhaka", isDhakaDivision: true },
  { name: "Narayanganj", division: "Dhaka", isDhakaDivision: true },
  { name: "Tangail", division: "Dhaka", isDhakaDivision: true },
  { name: "Narsingdi", division: "Dhaka", isDhakaDivision: true },
  { name: "Faridpur", division: "Dhaka", isDhakaDivision: true },
  { name: "Gopalganj", division: "Dhaka", isDhakaDivision: true },
  { name: "Kishoreganj", division: "Dhaka", isDhakaDivision: true },
  { name: "Madaripur", division: "Dhaka", isDhakaDivision: true },
  { name: "Manikganj", division: "Dhaka", isDhakaDivision: true },
  { name: "Munshiganj", division: "Dhaka", isDhakaDivision: true },
  { name: "Rajbari", division: "Dhaka", isDhakaDivision: true },
  { name: "Shariatpur", division: "Dhaka", isDhakaDivision: true },

  // Chattogram Division
  { name: "Chattogram", division: "Chattogram", isDhakaDivision: false },
  { name: "Cox's Bazar", division: "Chattogram", isDhakaDivision: false },
  { name: "Cumilla", division: "Chattogram", isDhakaDivision: false },
  { name: "Feni", division: "Chattogram", isDhakaDivision: false },
  { name: "Brahmanbaria", division: "Chattogram", isDhakaDivision: false },
  { name: "Chandpur", division: "Chattogram", isDhakaDivision: false },
  { name: "Noakhali", division: "Chattogram", isDhakaDivision: false },
  { name: "Lakshmipur", division: "Chattogram", isDhakaDivision: false },
  { name: "Bandarban", division: "Chattogram", isDhakaDivision: false },
  { name: "Khagrachhari", division: "Chattogram", isDhakaDivision: false },
  { name: "Rangamati", division: "Chattogram", isDhakaDivision: false },

  // Sylhet Division
  { name: "Sylhet", division: "Sylhet", isDhakaDivision: false },
  { name: "Moulvibazar", division: "Sylhet", isDhakaDivision: false },
  { name: "Habiganj", division: "Sylhet", isDhakaDivision: false },
  { name: "Sunamganj", division: "Sylhet", isDhakaDivision: false },

  // Rajshahi Division
  { name: "Rajshahi", division: "Rajshahi", isDhakaDivision: false },
  { name: "Bogura", division: "Rajshahi", isDhakaDivision: false },
  { name: "Pabna", division: "Rajshahi", isDhakaDivision: false },
  { name: "Sirajganj", division: "Rajshahi", isDhakaDivision: false },
  { name: "Naogaon", division: "Rajshahi", isDhakaDivision: false },
  { name: "Natore", division: "Rajshahi", isDhakaDivision: false },
  { name: "Chapainawabganj", division: "Rajshahi", isDhakaDivision: false },
  { name: "Joypurhat", division: "Rajshahi", isDhakaDivision: false },

  // Khulna Division
  { name: "Khulna", division: "Khulna", isDhakaDivision: false },
  { name: "Jashore", division: "Khulna", isDhakaDivision: false },
  { name: "Kushtia", division: "Khulna", isDhakaDivision: false },
  { name: "Satkhira", division: "Khulna", isDhakaDivision: false },
  { name: "Bagerhat", division: "Khulna", isDhakaDivision: false },
  { name: "Chuadanga", division: "Khulna", isDhakaDivision: false },
  { name: "Jhenaidah", division: "Khulna", isDhakaDivision: false },
  { name: "Magura", division: "Khulna", isDhakaDivision: false },
  { name: "Meherpur", division: "Khulna", isDhakaDivision: false },
  { name: "Narail", division: "Khulna", isDhakaDivision: false },

  // Barishal Division
  { name: "Barishal", division: "Barishal", isDhakaDivision: false },
  { name: "Patuakhali", division: "Barishal", isDhakaDivision: false },
  { name: "Bhola", division: "Barishal", isDhakaDivision: false },
  { name: "Pirojpur", division: "Barishal", isDhakaDivision: false },
  { name: "Barguna", division: "Barishal", isDhakaDivision: false },
  { name: "Jhalokathi", division: "Barishal", isDhakaDivision: false },

  // Rangpur Division
  { name: "Rangpur", division: "Rangpur", isDhakaDivision: false },
  { name: "Dinajpur", division: "Rangpur", isDhakaDivision: false },
  { name: "Gaibandha", division: "Rangpur", isDhakaDivision: false },
  { name: "Kurigram", division: "Rangpur", isDhakaDivision: false },
  { name: "Lalmonirhat", division: "Rangpur", isDhakaDivision: false },
  { name: "Nilphamari", division: "Rangpur", isDhakaDivision: false },
  { name: "Panchagarh", division: "Rangpur", isDhakaDivision: false },
  { name: "Thakurgaon", division: "Rangpur", isDhakaDivision: false },

  // Mymensingh Division
  { name: "Mymensingh", division: "Mymensingh", isDhakaDivision: false },
  { name: "Jamalpur", division: "Mymensingh", isDhakaDivision: false },
  { name: "Netrokona", division: "Mymensingh", isDhakaDivision: false },
  { name: "Sherpur", division: "Mymensingh", isDhakaDivision: false },
];
