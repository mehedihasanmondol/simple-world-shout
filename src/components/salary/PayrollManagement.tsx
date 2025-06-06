
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, Eye, Edit, Trash2, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Payroll, Profile } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface PayrollManagementProps {
  payrolls: Payroll[];
  profiles: Profile[];
  onRefresh: () => void;
}

export const PayrollManagement = ({ payrolls, profiles, onRefresh }: PayrollManagementProps) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = payroll.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.pay_period_start.includes(searchTerm) ||
                         payroll.pay_period_end.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || payroll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updatePayrollStatus = async (id: string, status: 'approved' | 'paid') => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('payroll')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: `Payroll ${status} successfully` 
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating payroll status:', error);
      toast({
        title: "Error",
        description: "Failed to update payroll status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePayroll = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('payroll')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payroll deleted successfully"
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting payroll:', error);
      toast({
        title: "Error",
        description: "Failed to delete payroll",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">Individual Payroll Management</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payrolls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Button */}
              <div className="sm:hidden">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <div className="space-y-4 mt-6">
                      <div>
                        <Label>Status Filter</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Filter */}
              <div className="hidden sm:block">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Payroll List */}
      <div className="space-y-3">
        {filteredPayrolls.map((payroll) => (
          <Card key={payroll.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Employee Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-medium text-gray-700 text-sm">
                      {payroll.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {payroll.profiles?.full_name || 'Unknown Employee'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {payroll.pay_period_start} to {payroll.pay_period_end}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{payroll.total_hours}h</span>
                      <span>${payroll.net_pay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payroll.status)}`}>
                    {payroll.status}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPayroll(payroll);
                        setShowDetailsDialog(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>

                    {payroll.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updatePayrollStatus(payroll.id, 'approved')}
                        disabled={loading}
                        className="h-8 px-3 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePayroll(payroll.id)}
                      disabled={loading}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPayrolls.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll records found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Create your first payroll record to get started"}
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Payroll
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payroll Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Payroll Details</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Employee</Label>
                  <div className="font-medium">{selectedPayroll.profiles?.full_name}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayroll.status)}`}>
                    {selectedPayroll.status}
                  </span>
                </div>
                <div>
                  <Label className="text-gray-600">Pay Period</Label>
                  <div className="font-medium">
                    {selectedPayroll.pay_period_start} to {selectedPayroll.pay_period_end}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Total Hours</Label>
                  <div className="font-medium">{selectedPayroll.total_hours}h</div>
                </div>
                <div>
                  <Label className="text-gray-600">Hourly Rate</Label>
                  <div className="font-medium">${selectedPayroll.hourly_rate}/hr</div>
                </div>
                <div>
                  <Label className="text-gray-600">Gross Pay</Label>
                  <div className="font-medium">${selectedPayroll.gross_pay.toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Deductions</Label>
                  <div className="font-medium">${selectedPayroll.deductions.toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Net Pay</Label>
                  <div className="font-medium text-green-600">${selectedPayroll.net_pay.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
