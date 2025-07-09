"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, BarChart3 } from "lucide-react"
import { ExportExcelButton } from "@/components/ui/export-excel-button"
import { CategorySelector } from "@/components/ui/category-selector"

interface ReportData {
    products: Array<{
        id: string
        code: string
        name: string
        currentStock: number
        minStock: number
        category: string
    }>
}

async function fetchReport(type: string, params: Record<string, string>): Promise<ReportData> {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`/api/reports?type=${type}&${query}`)
    if (!response.ok) {
        throw new Error("Failed to fetch report")
    }
    return response.json()
}


export default function ReportsPage() {
    const [reportType, setReportType] = useState<string>("stock")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [category, setCategory] = useState<string>("all")

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["report", reportType, startDate, endDate, category],
        queryFn: () => fetchReport(reportType, { startDate, endDate, category }),
        enabled: false, // No ejecutar automáticamente
    })


    const handleGenerateReport = () => {
        refetch()
    }

    // Validar si se puede generar el reporte
    const canGenerateReport = reportType !== "movements" || (startDate && endDate)


    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                    {data && (
                        <ExportExcelButton 
                            data={data.products}
                            type={reportType as any}
                            filename={`reporte-${reportType}-${new Date().toISOString().split("T")[0]}.xlsx`}
                        />
                    )}
                </div>

                {/* Report Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generar Reporte</CardTitle>
                        <CardDescription>Selecciona el tipo de reporte y los parámetros</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reportType">Tipo de Reporte</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo de reporte" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="stock">Stock Actual</SelectItem>
                                        <SelectItem value="movements">Movimientos</SelectItem>
                                        <SelectItem value="lowStock">Stock Bajo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {reportType === "movements" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Fecha Inicio</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">Fecha Fin</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <CategorySelector
                                    value={category}
                                    onValueChange={setCategory}
                                    placeholder="Todas las categorías"
                                />
                            </div>
                            <Button 
                                onClick={handleGenerateReport} 
                                disabled={!canGenerateReport}
                            >
                                Generar Reporte
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Report Results */}
                {data && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2" />
                                Resultados del Reporte
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead className="text-right">Stock Actual</TableHead>
                                            <TableHead className="text-right">Stock Mínimo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>{product.code}</TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell className="text-right">{product.currentStock}</TableCell>
                                                <TableCell className="text-right">{product.minStock}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Error al generar el reporte</AlertDescription>
                    </Alert>
                )}
            </div>
        </MainLayout>
    )
}