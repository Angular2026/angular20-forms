SELECT dc.id, w.encrypted_uuid, wh.current_state, dc.created_timestamp
FROM defaulting_clients dc
LEFT JOIN workflow_document w ON w.defaulting_client_id = dc.id
LEFT JOIN workflow_history wh ON wh.workflow_id = w.id
WHERE dc.counterparty_id = 72696
ORDER BY dc.id;

