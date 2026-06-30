import { useState } from 'react';
import { FileText, Upload, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const MOCK_DOCS = [
  { id: '1', name: 'Driver Policy Manual.pdf', size: '1.2 MB', chunks: 42, uploadedAt: '2026-06-20', status: 'indexed' },
  { id: '2', name: 'Route Restrictions - Maharashtra 2026.pdf', size: '850 KB', chunks: 18, uploadedAt: '2026-06-25', status: 'indexed' },
  { id: '3', name: 'Hazardous Materials Compliance.txt', size: '124 KB', chunks: 9, uploadedAt: '2026-06-28', status: 'indexed' },
];

export default function DocumentsPage() {
  const [docs] = useState(MOCK_DOCS);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Knowledge Base"
        description="Upload policy documents for the AI assistant to reference."
        actions={<Button disabled><Upload className="h-4 w-4" /> Upload document</Button>}
      />

      <div className="flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5 text-sm text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>RAG document upload is coming in Step 10. Documents shown are sample data for UI preview.</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded documents</CardTitle>
          <CardDescription>
            {docs.length} document{docs.length !== 1 ? 's' : ''} indexed · Dispatchers can query these via the AI Assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} · {doc.chunks} chunks · Uploaded {doc.uploadedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Badge variant="success" className="text-[10px]">Indexed</Badge>
                  <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="rounded-lg border border-dashed p-8 text-center">
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm font-medium mb-1">Upload policy or route documents</p>
        <p className="text-xs text-muted-foreground mb-4">PDF or TXT · Up to 10 MB each · Automatically chunked and indexed</p>
        <Button variant="outline" disabled>Choose file</Button>
      </div>
    </div>
  );
}
