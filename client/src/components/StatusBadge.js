import React from "react";
import { Clock, Truck, CheckCircle2, XCircle } from "lucide-react";

const config = {
  Pending: { class: "badge-pending", icon: Clock },
  Dispatched: { class: "badge-dispatched", icon: Truck },
  Delivered: { class: "badge-delivered", icon: CheckCircle2 },
  Cancelled: { class: "badge-cancelled", icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const { class: cls, icon: Icon } = config[status] || config.Pending;
  return (
    <span className={`badge ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default StatusBadge;
