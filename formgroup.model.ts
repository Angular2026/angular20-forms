SELECT business_group_id,
       COUNT(*) FILTER (WHERE country_of_incorporation_id IS NOT NULL) AS nb_pays_renseigne,
       COUNT(*) FILTER (WHERE country_of_incorporation_id IS NULL)     AS nb_pays_null
FROM counterparty_characteristics
WHERE rmpmid IN (
    SELECT DISTINCT parent_rmpm_id 
    FROM counterparty_characteristics 
    WHERE parent_rmpm_id IS NOT NULL
)
GROUP BY business_group_id
HAVING COUNT(*) FILTER (WHERE country_of_incorporation_id IS NOT NULL) > 0
   AND COUNT(*) FILTER (WHERE country_of_incorporation_id IS NULL) > 0
ORDER BY business_group_id;

SELECT rmpmid, parent_rmpm_id, business_group_id, country_of_incorporation_id
FROM counterparty_characteristics
WHERE business_group_id = <ID_TROUVÉ>
ORDER BY country_of_incorporation_id IS NULL;


SELECT rmpmid, parent_rmpm_id, business_group_id, country_of_incorporation_id
FROM counterparty_characteristics
WHERE business_group_id = (
    SELECT business_group_id 
    FROM counterparty_characteristics 
    WHERE business_group_id IS NOT NULL
    GROUP BY business_group_id 
    HAVING COUNT(*) >= 3
    LIMIT 1
)
ORDER BY rmpmid;
