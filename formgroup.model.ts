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


-- 1. Forcer un pays NULL sur un des parents existants du groupe 9
UPDATE counterparty_characteristics
   SET country_of_incorporation_id = NULL
 WHERE rmpmid = '4AAV57013';

INSERT INTO counterparty_characteristics
(id, rmpmid, parent_rmpm_id, business_group_id, country_of_incorporation_id)
SELECT COALESCE(MAX(id), 0) + 1, '4AAZ900001', '4AAC57046', 9, 113
FROM counterparty_characteristics;

INSERT INTO counterparty_characteristics
(id, rmpmid, parent_rmpm_id, business_group_id, country_of_incorporation_id)
SELECT COALESCE(MAX(id), 0) + 1, '4AAZ900002', '4AAV57013', 9, NULL
FROM counterparty_characteristics;


-- 3. Créer une entité enfant qui désigne 4AAV57013 comme parent (pays NULL -> alimente d)
INSERT INTO counterparty_characteristics (rmpmid, parent_rmpm_id, business_group_id, country_of_incorporation_id)
VALUES ('4AAZ900002', '4AAV57013', 9, NULL);

-- 4. Vérification du groupe complet
SELECT rmpmid, parent_rmpm_id, business_group_id, country_of_incorporation_id
FROM counterparty_characteristics
WHERE business_group_id = 9
ORDER BY rmpmid;

