import React, { useEffect, useState } from 'react';
import { getWallets } from '@/services/api/walletsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';

const WalletApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testWalletApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWallets();
      console.log('API Response:', result);
      setResponse(result);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically test on component mount
    testWalletApi();
  }, []);

  return (
    <PageLayout
      title="Wallet API Test"
      description="Testing wallet API connectivity"
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testWalletApi} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Testing...' : 'Test Wallet API'}
          </Button>

          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-700 font-medium">Error:</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}

          {response && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-medium">Response:</h3>
              <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default WalletApiTest;
