const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://shashikumarezhil_db_user:qwerty1234@payfi.ttbkd39.mongodb.net/?appName=payfi";

const users = [
  {
    name: "Shashikumar",
    pan: "UHNPS7269P",
    email: "shashikumarezhil@gmail.com",
    aadhar: "123456789012",
    phone: "9876543210",
    createdAt: new Date()
  },
  {
    name: "Srivatsa",
    pan: "UHNPS7269P",
    email: "svatsa2005@gmail.com",
    aadhar: "234567890123",
    phone: "9876543211",
    createdAt: new Date()
  },
  {
    name: "Dhanush",
    pan: "GBPPA5010L",
    email: "dhanushvallalar@gmail.com",
    aadhar: "345678901234",
    phone: "9876543212",
    createdAt: new Date()
  },
  {
    name: "Iniya Nandhitha N",
    pan: "CXZPN8765K",
    email: "iniyanandhitha2405@gmail.com",
    aadhar: "448769027183",
    phone: "9840276052",
    createdAt: new Date()
  },
  {
    name: "Arabhi Gopan",
    pan: "DKLMN9876M",
    email: "arabhigopan171@gmail.com",
    aadhar: "940542533648",
    phone: "7824800133",
    createdAt: new Date()
  },
  // Mock data
  {
    name: "Rajesh Kumar",
    pan: "ABCDE1234F",
    email: "rajesh.kumar@example.com",
    aadhar: "567890123456",
    phone: "9123456789",
    createdAt: new Date()
  },
  {
    name: "Priya Sharma",
    pan: "FGHIJ5678K",
    email: "priya.sharma@example.com",
    aadhar: "678901234567",
    phone: "9234567890",
    createdAt: new Date()
  },
  {
    name: "Amit Patel",
    pan: "KLMNO9012P",
    email: "amit.patel@example.com",
    aadhar: "789012345678",
    phone: "9345678901",
    createdAt: new Date()
  },
  {
    name: "Sneha Reddy",
    pan: "PQRST3456Q",
    email: "sneha.reddy@example.com",
    aadhar: "890123456789",
    phone: "9456789012",
    createdAt: new Date()
  },
  {
    name: "Vikram Singh",
    pan: "UVWXY7890R",
    email: "vikram.singh@example.com",
    aadhar: "901234567890",
    phone: "9567890123",
    createdAt: new Date()
  },
  {
    name: "Ananya Desai",
    pan: "ZABCD1234S",
    email: "ananya.desai@example.com",
    aadhar: "012345678901",
    phone: "9678901234",
    createdAt: new Date()
  },
  {
    name: "Arjun Menon",
    pan: "EFGHI5678T",
    email: "arjun.menon@example.com",
    aadhar: "123450987654",
    phone: "9789012345",
    createdAt: new Date()
  }
];

async function populateDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    const database = client.db("payfi");
    const collection = database.collection("users");

    // Clear existing data (optional)
    // await collection.deleteMany({});
    // console.log("Cleared existing data");

    // Insert users
    const result = await collection.insertMany(users);
    console.log(`${result.insertedCount} users inserted successfully!`);

    // Create indexes for better query performance
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ pan: 1 });
    await collection.createIndex({ aadhar: 1 });
    console.log("Indexes created successfully!");

    // Display inserted data
    const allUsers = await collection.find({}).toArray();
    console.log("\nInserted Users:");
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   PAN: ${user.pan}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Aadhar: ${user.aadhar}`);
      console.log(`   Phone: ${user.phone}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
    console.log("\nConnection closed");
  }
}

populateDatabase();
