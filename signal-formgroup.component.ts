SELECT dc.id, dc.is_default, dc.decision_making_committee, dc.modified_timestamp
FROM defaulting_clients dc
JOIN counterparty c ON c.id = dc.counterparty_id
WHERE c.rmpmid = '4AAM784406'
ORDER BY dc.id;
