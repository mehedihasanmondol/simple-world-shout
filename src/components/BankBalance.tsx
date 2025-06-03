
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp, TrendingDown, Building, DollarSign, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount, BankTransaction, Profile, Client, Project } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { ProfileSelector } from "@/components/common/ProfileSelector";
import { TransactionTable } from "@/components/bank/TransactionTable";
import { TransactionForm } from "@/components/bank/TransactionForm";

export const BankBalance = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BankTransaction | null>(null);
  const { toast } = useToast();

  const categoryOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
    { value: "transfer", label: "Transfer" },
    { value: "salary", label: "Salary" },
    { value: "equipment", label: "Equipment" },
    { value: "materials", label: "Materials" },
    { value: "travel", label: "Travel" },
    { value: "office", label: "Office" },
    { value: "utilities", label: "Utilities" },
    { value: "marketing", label: "Marketing" },
    { value: "other", label: "Other" }
  ];

  const [transactionFormData, setTransactionFormData] = useState({
    bank_account_id: "",
    description: "",
    amount: 0,
    type: "deposit" as "deposit" | "withdrawal",
    category: "income" as typeof categoryOptions[0]["value"],
    date: new Date().toISOString().split('T')[0],
    profile_id: "",
    client_id: "",
    project_id: ""
  });

  const [quickTransactionData, setQuickTransactionData] = useState({
    bank_account_id: "",
    description: "",
    amount: 0,
    category: "income" as typeof categoryOptions[0]["value"],
    date: new Date().toISOString().split('T')[0],
    profile_id: "",
    client_id: "",
    project_id: ""
  });

  const [bankFormData, setBankFormData] = useState({
    bank_name: "",
    account_number: "",
    bsb_code: "",
    swift_code: "",
    account_holder_name: "",
    opening_balance: 0,
    is_primary: false,
    profile_id: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchBankAccounts(),
        fetchTransactions(),
        fetchProfiles(),
        fetchClients(),
        fetchProjects()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select(`
          *,
          profiles!bank_accounts_profile_id_fkey (id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data as BankAccount[]);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_transactions')
        .select(`
          *,
          clients (id, company),
          projects (id, name),
          profiles (id, full_name),
          bank_accounts (id, bank_name, account_number)
        `)
        .order('date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data as BankTransaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company');

      if (error) throw error;
      setClients(data as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (error) throw error;
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        ...transactionFormData,
        client_id: transactionFormData.client_id || null,
        project_id: transactionFormData.project_id || null,
        profile_id: transactionFormData.profile_id || null
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from('bank_transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);

        if (error) throw error;
        toast({ title: "Success", description: "Transaction updated successfully" });
      } else {
        const { error } = await supabase
          .from('bank_transactions')
          .insert([transactionData]);

        if (error) throw error;
        toast({ title: "Success", description: "Transaction added successfully" });
      }
      
      setIsTransactionDialogOpen(false);
      setEditingTransaction(null);
      resetTransactionForm();
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTransaction = async (type: 'deposit' | 'withdrawal') => {
    setLoading(true);

    try {
      const transactionData = {
        ...quickTransactionData,
        type,
        profile_id: quickTransactionData.profile_id || null,
        client_id: quickTransactionData.client_id || null,
        project_id: quickTransactionData.project_id || null
      };

      const { error } = await supabase
        .from('bank_transactions')
        .insert([transactionData]);

      if (error) throw error;
      toast({ title: "Success", description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} added successfully` });
      
      if (type === 'deposit') {
        setIsDepositDialogOpen(false);
      } else {
        setIsWithdrawDialogOpen(false);
      }
      
      resetQuickTransactionForm();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding quick transaction:', error);
      toast({
        title: "Error",
        description: `Failed to add ${type}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bankData = {
        ...bankFormData,
        profile_id: bankFormData.profile_id || null
      };

      const { error } = await supabase
        .from('bank_accounts')
        .insert([bankData]);

      if (error) throw error;
      toast({ title: "Success", description: "Bank account added successfully" });
      
      setIsBankDialogOpen(false);
      resetBankForm();
      fetchBankAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast({
        title: "Error",
        description: "Failed to add bank account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction: BankTransaction) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
      bank_account_id: transaction.bank_account_id || "",
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      profile_id: transaction.profile_id || "",
      client_id: transaction.client_id || "",
      project_id: transaction.project_id || ""
    });
    setIsTransactionDialogOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Transaction deleted successfully" });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const resetTransactionForm = () => {
    setTransactionFormData({
      bank_account_id: "",
      description: "",
      amount: 0,
      type: "deposit",
      category: "income",
      date: new Date().toISOString().split('T')[0],
      profile_id: "",
      client_id: "",
      project_id: ""
    });
  };

  const resetQuickTransactionForm = () => {
    setQuickTransactionData({
      bank_account_id: "",
      description: "",
      amount: 0,
      category: "income",
      date: new Date().toISOString().split('T')[0],
      profile_id: "",
      client_id: "",
      project_id: ""
    });
  };

  const resetBankForm = () => {
    setBankFormData({
      bank_name: "",
      account_number: "",
      bsb_code: "",
      swift_code: "",
      account_holder_name: "",
      opening_balance: 0,
      is_primary: false,
      profile_id: ""
    });
  };

  const calculateBankBalance = (bankAccountId: string) => {
    const bankAccount = bankAccounts.find(ba => ba.id === bankAccountId);
    const openingBalance = bankAccount?.opening_balance || 0;
    
    const bankTransactions = transactions.filter(t => t.bank_account_id === bankAccountId);
    const transactionsTotal = bankTransactions.reduce((sum, t) => {
      return sum + (t.type === 'deposit' ? t.amount : -t.amount);
    }, 0);
    
    return openingBalance + transactionsTotal;
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + calculateBankBalance(account.id), 0);
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);

  if (loading && bankAccounts.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Balance</h1>
            <p className="text-gray-600">Manage bank accounts and transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Deposit</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleQuickTransaction('deposit'); }} className="space-y-4">
                <div>
                  <Label htmlFor="deposit_bank_account">Bank Account</Label>
                  <Select value={quickTransactionData.bank_account_id} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, bank_account_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bank_name} - {account.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deposit_client">Client (Optional)</Label>
                  <Select value={quickTransactionData.client_id} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deposit_project">Project (Optional)</Label>
                  <Select value={quickTransactionData.project_id} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Project</SelectItem>
                      {projects.filter(p => !quickTransactionData.client_id || p.client_id === quickTransactionData.client_id).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ProfileSelector
                  profiles={profiles}
                  selectedProfileId={quickTransactionData.profile_id}
                  onProfileSelect={(profileId) => setQuickTransactionData({ ...quickTransactionData, profile_id: profileId })}
                  label="Employee (Optional)"
                  placeholder="Select employee"
                  showRoleFilter={true}
                />

                <div>
                  <Label htmlFor="deposit_description">Description</Label>
                  <Input
                    id="deposit_description"
                    value={quickTransactionData.description}
                    onChange={(e) => setQuickTransactionData({ ...quickTransactionData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deposit_amount">Amount</Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    step="0.01"
                    value={quickTransactionData.amount}
                    onChange={(e) => setQuickTransactionData({ ...quickTransactionData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deposit_category">Category</Label>
                  <Select value={quickTransactionData.category} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, category: value as typeof quickTransactionData.category })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                  {loading ? "Adding..." : "Add Deposit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-50">
                <Minus className="h-4 w-4" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Withdrawal</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleQuickTransaction('withdrawal'); }} className="space-y-4">
                <div>
                  <Label htmlFor="withdraw_bank_account">Bank Account</Label>
                  <Select value={quickTransactionData.bank_account_id} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, bank_account_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bank_name} - {account.account_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="withdraw_client">Client (Optional)</Label>
                  <Select value={quickTransactionData.client_id} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="withdraw_project">Project (Optional)</Label>
                  <Select value={quickTransactionData.project_id} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Project</SelectItem>
                      {projects.filter(p => !quickTransactionData.client_id || p.client_id === quickTransactionData.client_id).map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ProfileSelector
                  profiles={profiles}
                  selectedProfileId={quickTransactionData.profile_id}
                  onProfileSelect={(profileId) => setQuickTransactionData({ ...quickTransactionData, profile_id: profileId })}
                  label="Employee (Optional)"
                  placeholder="Select employee"
                  showRoleFilter={true}
                />

                <div>
                  <Label htmlFor="withdraw_description">Description</Label>
                  <Input
                    id="withdraw_description"
                    value={quickTransactionData.description}
                    onChange={(e) => setQuickTransactionData({ ...quickTransactionData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="withdraw_amount">Amount</Label>
                  <Input
                    id="withdraw_amount"
                    type="number"
                    step="0.01"
                    value={quickTransactionData.amount}
                    onChange={(e) => setQuickTransactionData({ ...quickTransactionData, amount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="withdraw_category">Category</Label>
                  <Select value={quickTransactionData.category} onValueChange={(value) => setQuickTransactionData({ ...quickTransactionData, category: value as typeof quickTransactionData.category })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                  {loading ? "Adding..." : "Add Withdrawal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Bank
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={bankFormData.bank_name}
                    onChange={(e) => setBankFormData({ ...bankFormData, bank_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="account_holder_name">Account Holder Name</Label>
                  <Input
                    id="account_holder_name"
                    value={bankFormData.account_holder_name}
                    onChange={(e) => setBankFormData({ ...bankFormData, account_holder_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={bankFormData.account_number}
                    onChange={(e) => setBankFormData({ ...bankFormData, account_number: e.target.value })}
                    required
                  />
                </div>

                <ProfileSelector
                  profiles={profiles}
                  selectedProfileId={bankFormData.profile_id}
                  onProfileSelect={(profileId) => setBankFormData({ ...bankFormData, profile_id: profileId })}
                  label="Profile (Optional)"
                  placeholder="Select profile"
                  showRoleFilter={true}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bsb_code">BSB Code</Label>
                    <Input
                      id="bsb_code"
                      value={bankFormData.bsb_code}
                      onChange={(e) => setBankFormData({ ...bankFormData, bsb_code: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="swift_code">SWIFT Code</Label>
                    <Input
                      id="swift_code"
                      value={bankFormData.swift_code}
                      onChange={(e) => setBankFormData({ ...bankFormData, swift_code: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="opening_balance">Opening Balance</Label>
                  <Input
                    id="opening_balance"
                    type="number"
                    step="0.01"
                    value={bankFormData.opening_balance}
                    onChange={(e) => setBankFormData({ ...bankFormData, opening_balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding..." : "Add Bank Account"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
              </DialogHeader>
              <TransactionForm
                formData={transactionFormData}
                setFormData={setTransactionFormData}
                onSubmit={handleTransactionSubmit}
                bankAccounts={bankAccounts}
                profiles={profiles}
                clients={clients}
                projects={projects}
                loading={loading}
                editingTransaction={editingTransaction}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalDeposits.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'deposit').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Withdrawals</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalWithdrawals.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'withdrawal').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Bank Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Accounts ({bankAccounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.map((account) => {
                const accountTransactions = transactions.filter(t => t.bank_account_id === account.id);
                const currentBalance = accountTransactions.reduce((sum, transaction) => {
                  return transaction.type === 'deposit' 
                    ? sum + transaction.amount 
                    : sum - transaction.amount;
                }, account.opening_balance);

                return (
                  <div key={account.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.bank_name}</h3>
                        <p className="text-sm text-gray-600">
                          {account.account_holder_name} • ****{account.account_number.slice(-4)}
                        </p>
                        {account.bsb_code && (
                          <p className="text-xs text-gray-500">BSB: {account.bsb_code}</p>
                        )}
                        {account.profiles && (
                          <p className="text-xs text-gray-500">Profile: {account.profiles.full_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          ${currentBalance.toFixed(2)}
                        </div>
                        {account.is_primary && (
                          <Badge variant="default" className="mt-1">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
