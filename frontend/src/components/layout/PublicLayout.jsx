import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}