interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <header
      style={{
        backgroundColor: "#FFFFFF",
        color: "#2E7D32", // Material Design Green 800
        padding: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: "500",
          textAlign: "center",
          color: "#1B5E20", // Material Design Green 900
        }}
      >
        {title}
      </h1>
    </header>
  );
};
