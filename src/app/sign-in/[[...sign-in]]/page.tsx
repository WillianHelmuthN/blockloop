import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <SignIn
        appearance={{
          variables: { colorBackground: "white", colorText: "black" },
        }}
      />
    </main>
  );
}
