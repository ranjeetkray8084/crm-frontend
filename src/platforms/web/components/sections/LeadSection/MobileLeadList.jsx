import MobileLeadCard from './MobileLeadCard';

const MobileLeadList = ({
  leads = [],
  onStatusUpdate,
  onDelete,
  onAddRemark,
  onGetRemarks,
  onAssign,
  onUnassign,
  onUpdate,
  onAddFollowUp,
  onViewFollowUps
}) => {
  const getValidLeadId = (lead) => lead?.leadId ?? lead?.id;
  const validLeads = leads.filter((lead) => getValidLeadId(lead));

  return (
    <div className="md:hidden space-y-4">
      {validLeads.map((lead) => {
        const leadId = getValidLeadId(lead);
        return (
          <MobileLeadCard
            key={leadId}
            lead={lead}
            onStatusUpdate={onStatusUpdate}
            onDelete={onDelete}
            onAddRemark={onAddRemark}
            onViewRemarks={onGetRemarks}
            onAssign={onAssign}
            onUnassign={onUnassign}
            onUpdate={onUpdate}
            onAddFollowUp={onAddFollowUp}
            onViewFollowUps={onViewFollowUps}
          />
        );
      })}
    </div>
  );
};

export default MobileLeadList;