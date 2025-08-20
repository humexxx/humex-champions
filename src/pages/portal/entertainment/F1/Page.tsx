import { useState, useEffect } from 'react';
import { PageContent, PageHeader } from 'src/components';
import { Page } from 'src/components/layout';
import { F1Header, F1Content } from './_components';

interface F1Data {
  currentSeason: string;
  nextRace: {
    name: string;
    date: string;
    circuit: string;
  };
  standings: {
    drivers: any[];
    constructors: any[];
  };
}

const F1Page = () => {
  // 1. Data fetching
  const [f1Data, setF1Data] = useState<F1Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('races');

  // 2. Data fetching logic
  useEffect(() => {
    const fetchF1Data = async () => {
      setLoading(true);
      try {
        // TODO: Implement F1 API integration
        // For now, using mock data
        const mockData: F1Data = {
          currentSeason: '2025',
          nextRace: {
            name: 'Monaco Grand Prix',
            date: '2025-05-25',
            circuit: 'Circuit de Monaco',
          },
          standings: {
            drivers: [],
            constructors: [],
          },
        };

        setF1Data(mockData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch F1 data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchF1Data();
  }, []);

  // 3. Page logic
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  // 4. Render structure
  return (
    <Page title="Formula 1">
      <PageHeader
        title="Formula 1"
        description="Track races, standings, and results for the current F1 season"
      />
      <PageContent>
        <F1Header
          currentSeason={f1Data?.currentSeason || '2025'}
          nextRace={f1Data?.nextRace}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          loading={loading}
        />

        <F1Content
          f1Data={f1Data}
          selectedTab={selectedTab}
          loading={loading}
          error={error}
        />
      </PageContent>
    </Page>
  );
};

export default F1Page;
