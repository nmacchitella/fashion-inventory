// scripts/create-user.ts
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function createUser(
  email: string,
  password: string,
  name: string | null = null,
  role: Role = "USER"
) {
  const hashedPassword = await hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    console.log(`User created successfully:`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Example usage:
async function main() {
  try {
    await createUser(
      "admin@example.com",
      "your-secure-password",
      "Admin User",
      "ADMIN"
    );
  } catch (error) {
    console.error("Failed to create user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
