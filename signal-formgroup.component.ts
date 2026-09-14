@Query("""
    select dc from DefaultingClient dc
    left join WorkflowDocument w on w.defaultingClient=dc
    join WorkflowHistory wh on wh.workflow=w
    where dc.counterparty.characteristics.rmpmid = :rmpmId
      and wh.currentState = 'DRAFT'
    order by dc.id desc
    limit 1
""")
Optional<DefaultingClient> findInDraftStateByRmpmId(@Param("rmpmId") String rmpmId);
