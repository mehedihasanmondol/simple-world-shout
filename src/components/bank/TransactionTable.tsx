
import { Badge } from "@/components/ui/badge";
import { BankTransaction } from "@/types/database";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { Edit, Trash2 } from "lucide-react";

interface TransactionTableProps {
  transactions: BankTransaction[];
  onEdit: (transaction: BankTransaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionTable = ({ transactions, onEdit, onDelete }: TransactionTableProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found. Add your first transaction to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Client/Project</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Profile</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-600">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-gray-900">{transaction.description}</td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="capitalize">{transaction.category}</Badge>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {transaction.clients?.company && (
                  <div>
                    <div className="font-medium">{transaction.clients.company}</div>
                    {transaction.projects?.name && (
                      <div className="text-sm text-gray-500">{transaction.projects.name}</div>
                    )}
                  </div>
                )}
                {!transaction.clients?.company && transaction.projects?.name && (
                  <div className="text-sm text-gray-500">{transaction.projects.name}</div>
                )}
                {!transaction.clients?.company && !transaction.projects?.name && (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {transaction.profiles?.full_name || '-'}
              </td>
              <td className="py-3 px-4">
                <span className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
              </td>
              <td className="py-3 px-4">
                <Badge variant={transaction.type === 'deposit' ? 'default' : 'destructive'} className="capitalize">
                  {transaction.type}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <ActionDropdown
                  items={[
                    {
                      label: "Edit",
                      onClick: () => onEdit(transaction),
                      icon: <Edit className="h-4 w-4" />
                    },
                    {
                      label: "Delete",
                      onClick: () => onDelete(transaction.id),
                      icon: <Trash2 className="h-4 w-4" />,
                      variant: "destructive"
                    }
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
