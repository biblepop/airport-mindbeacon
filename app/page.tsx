import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import StatCards from "./components/StatCards";
import ComparisonSection from "./components/ComparisonSection";
import FlowSection from "./components/FlowSection";
import DashboardSection from "./components/DashboardSection";
import CalmRoomSection from "./components/CalmRoomSection";
import WorkerMonitor from "./components/WorkerMonitor";
import TodayStats from "./components/TodayStats";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-airport-bg">
      <Header />
      <HeroBanner />
      <StatCards />
      <ComparisonSection />
      <FlowSection />
      <DashboardSection />
      <CalmRoomSection />
      <WorkerMonitor />
      <TodayStats />
      <Footer />
    </div>
  );
}
