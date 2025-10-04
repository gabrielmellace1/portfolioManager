import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './hooks/usePortfolio';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PortfolioPage from './pages/PortfolioPage';
import AddAsset from './pages/AddAsset';
import CreatePortfolio from './pages/CreatePortfolio';
import Analytics from './pages/Analytics';

function App() {
  return (
    <PortfolioProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio/:id" element={<PortfolioPage />} />
            <Route path="/add-asset" element={<AddAsset />} />
            <Route path="/create-portfolio" element={<CreatePortfolio />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </Router>
    </PortfolioProvider>
  );
}

export default App;
