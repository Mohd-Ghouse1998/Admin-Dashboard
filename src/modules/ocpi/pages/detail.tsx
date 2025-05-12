
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OCPIDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">OCPI Detail: {id}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>OCPI Partner Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>OCPI partner detail view will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OCPIDetail;
