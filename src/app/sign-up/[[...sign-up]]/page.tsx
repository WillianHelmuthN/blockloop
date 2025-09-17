import { SignUp } from "@clerk/nextjs";

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
      <SignUp
        appearance={{
          variables: { colorBackground: "white", colorText: "black" },
        }}
      />
    </main>
  );
}
