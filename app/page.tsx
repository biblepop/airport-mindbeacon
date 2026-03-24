import Header from "./components/Header";
import MainTabs from "./components/MainTabs";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-airport-bg">
      <Header />
      <MainTabs />
      <Footer />
    </div>
  );
}
