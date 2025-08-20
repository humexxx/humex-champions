import { useState, useEffect } from 'react';
import { PageContent, PageHeader } from 'src/components';
import { Page } from 'src/components/layout';
import { F1Header, F1Content } from './_components';
import { F1Service } from 'src/services/f1Service';

interface F1Data {
  currentSeason: string;
  nextRace?: {
    name: string;
    date: string;
    circuit: string;
  };
  standings: {
    drivers: any[];
    constructors: any[];
  };
  news: any[];
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
      setError(null);

      try {
        console.log('🏎️ Fetching F1 data...');

        // Use the F1 service to get comprehensive page data
        const pageData = await F1Service.getF1PageData();

        // Transform the data to match our component's expected structure
        const transformedData: F1Data = {
          currentSeason: pageData.currentSeason,
          nextRace:
            (pageData.nextRace as any)?.success &&
            (pageData.nextRace as any)?.data
              ? {
                  name: (pageData.nextRace as any).data.name || 'Unknown Race',
                  date: (pageData.nextRace as any).data.date || '',
                  circuit:
                    (pageData.nextRace as any).data.circuit?.name ||
                    'Unknown Circuit',
                }
              : undefined,
          standings: {
            drivers: (pageData.drivers as any)?.success
              ? (pageData.drivers as any).data
              : [],
            constructors: (pageData.constructors as any)?.success
              ? (pageData.constructors as any).data
              : [],
          },
          news: (pageData.news as any)?.success
            ? (pageData.news as any).data
            : [],
        };

        setF1Data(transformedData);
        console.log('✅ F1 data loaded successfully', transformedData);
      } catch (err) {
        console.error('❌ Error fetching F1 data:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch F1 data';
        setError(errorMessage);

        // Fallback to basic data structure
        setF1Data({
          currentSeason: new Date().getFullYear().toString(),
          nextRace: undefined,
          standings: { drivers: [], constructors: [] },
          news: [],
        });
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
          currentSeason={
            f1Data?.currentSeason || new Date().getFullYear().toString()
          }
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
