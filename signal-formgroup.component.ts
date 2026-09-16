Salut 👋

J'ai eu un `NonUniqueResultException` sur `findInDraftStateByRmpmId` : la requête remontait 2 résultats pour la même contrepartie, donc le save plantait.

J'ai mis un `order by dc.id desc` + passage en `List` / `Pageable` avec `.stream().findFirst()` dans l'Impl, pour prendre le plus récent.

Ça me gêne un peu comme fix : on prend le dernier id, ce qui n'est pas vraiment une règle métier. J'ai hésité à filtrer sur le workflow en cours via `encryptedUuid` à la place. Et je me demande aussi d'où viennent ces doublons au départ.

Tu en penses quoi ? Le commit est poussé si tu veux jeter un œil.