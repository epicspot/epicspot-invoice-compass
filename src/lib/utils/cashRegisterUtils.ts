
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF"
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs";
    case "closed":
      return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs";
    case "reconciling":
      return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs";
    default:
      return "";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "open":
      return "Ouverte";
    case "closed":
      return "Fermée";
    case "reconciling":
      return "En rapprochement";
    default:
      return status;
  }
};

export const formatInvoiceStatus = (status: 'draft' | 'sent' | 'paid' | 'overdue') => {
  const statusClasses = {
    draft: 'bg-gray-200 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };
  
  const statusLabels = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
  };
  
  return {
    className: statusClasses[status],
    label: statusLabels[status]
  };
};
