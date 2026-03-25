'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { uploadRecords } from './actions';
import type { Campaign, ExcelUpload } from '@/types';

interface ParsedRow {
  date: string;
  amount: number;
  refund: number;
  orderCount: number;
  cancelCount: number;
  ref: string;
}

interface MappedRow extends ParsedRow {
  campaign_id: string | null;
  campaign_name: string | null;
  commission_rate: number;
}

export default function AdminRecordsPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');
  const [parsedRows, setParsedRows] = useState<MappedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [overwrite, setOverwrite] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<ExcelUpload[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Load campaigns with imweb_link for ref matching
    supabase
      .from('campaigns')
      .select('*, product:products(name)')
      .in('status', ['ONGOING', 'COMPLETED'])
      .then(({ data }) => setCampaigns((data as Campaign[]) || []));

    // Load upload history
    supabase
      .from('excel_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setUploadHistory((data as ExcelUpload[]) || []));
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    const mapped: MappedRow[] = rows.map((row: any) => {
      const ref = String(row['ref'] || row['REF'] || row['utm_ref'] || row['UTM'] || '').trim();
      const matchedCampaign = campaigns.find((c) => {
        if (!c.imweb_link) return false;
        return c.imweb_link.includes(ref) || ref === c.id;
      });

      return {
        date: String(row['주문일'] || row['date'] || row['날짜'] || ''),
        amount: Number(row['결제액'] || row['amount'] || row['판매액'] || 0),
        refund: Number(row['환불액'] || row['refund'] || 0),
        orderCount: Number(row['주문건수'] || row['orders'] || row['건수'] || 1),
        cancelCount: Number(row['취소건수'] || row['cancels'] || 0),
        ref,
        campaign_id: matchedCampaign?.id || null,
        campaign_name: matchedCampaign ? (matchedCampaign.product as any)?.name : null,
        commission_rate: matchedCampaign?.commission_rate || 0,
      };
    });

    setParsedRows(mapped);
    setStep('preview');
  };

  const matchedRows = parsedRows.filter((r) => r.campaign_id);
  const unmatchedRows = parsedRows.filter((r) => !r.campaign_id);

  const handleUpload = async () => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const records = matchedRows.map((r) => ({
      campaign_id: r.campaign_id!,
      record_date: r.date,
      order_count: r.orderCount,
      cancel_count: r.cancelCount,
      total_sales_amount: r.amount,
      refund_amount: r.refund,
      influencer_commission: (r.amount - r.refund) * r.commission_rate / 100,
    }));

    const result = await uploadRecords(user.id, fileName, records, overwrite);

    if (result.success) {
      toast.success(`${matchedRows.length}건의 실적이 업로드되었습니다.`);
      setStep('done');
    } else {
      toast.error('업로드 실패: ' + result.error);
    }
    setUploading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">실적 데이터 업로드</h1>

      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              엑셀 파일 업로드
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              아임웹에서 다운로드한 판매 엑셀 파일을 업로드하세요.
              필요 컬럼: 주문일, 결제액, ref (UTM)
            </p>
            <div className="space-y-2">
              <Label>엑셀 파일 (.xlsx, .xls)</Label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                미리보기 - {fileName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Badge variant="default" className="text-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  매핑 성공: {matchedRows.length}건
                </Badge>
                {unmatchedRows.length > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    매핑 실패: {unmatchedRows.length}건
                  </Badge>
                )}
              </div>

              <div className="rounded-md border max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>상태</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>REF</TableHead>
                      <TableHead>캠페인</TableHead>
                      <TableHead className="text-right">결제액</TableHead>
                      <TableHead className="text-right">환불액</TableHead>
                      <TableHead className="text-right">주문</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row, i) => (
                      <TableRow key={i} className={!row.campaign_id ? 'bg-red-50' : ''}>
                        <TableCell>
                          {row.campaign_id ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="font-mono text-xs">{row.ref}</TableCell>
                        <TableCell>{row.campaign_name || '-'}</TableCell>
                        <TableCell className="text-right">{row.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.refund.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.orderCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="rounded"
              />
              동일 날짜 데이터 덮어쓰기
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep('upload'); setParsedRows([]); }}>
              다시 선택
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || matchedRows.length === 0}
            >
              {uploading ? '업로드 중...' : `${matchedRows.length}건 업로드`}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium">업로드가 완료되었습니다.</p>
            <Button className="mt-4" onClick={() => { setStep('upload'); setParsedRows([]); }}>
              새 파일 업로드
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>업로드 이력</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>파일명</TableHead>
                    <TableHead>전체</TableHead>
                    <TableHead>성공</TableHead>
                    <TableHead>실패</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadHistory.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.file_name}</TableCell>
                      <TableCell>{u.total_rows}</TableCell>
                      <TableCell>{u.matched_rows}</TableCell>
                      <TableCell>{u.unmatched_rows}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'COMPLETED' ? 'default' : u.status === 'FAILED' ? 'destructive' : 'outline'}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(u.created_at).toLocaleDateString('ko-KR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
