import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/server/db";

const SyncUserPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!user.emailAddresses[0]?.emailAddress) {
    redirect("/sign-in");
  }

  const { firstName, lastName, imageUrl } = user;

  try {
    const emailAddress = user.emailAddresses[0]?.emailAddress;
    if (!emailAddress) {
      redirect("/sign-in");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await db.user.upsert({
      where: {
        emailAddress,
      },
      update: {
        firstName,
        lastName,
        imageUrl,
      },
      create: {
        id: userId,
        firstName,
        lastName,
        imageUrl,
        emailAddress,
      },
    });
  } catch (err) {
    console.error(
      "Database error:",
      err instanceof Error ? err.message : "Unknown error occurred",
    );
  }

  return redirect("/dashboard");
};

export default SyncUserPage;
