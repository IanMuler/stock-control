-- StockControl Database Raw Backup
-- Generated on: 2025-06-30T02:08:24.170Z
-- This backup contains the actual data from the database
-- 

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- Disable triggers for faster inserts
SET session_replication_role = replica;


-- Data for table: Account
-- Records found: 3
DELETE FROM "Account";
INSERT INTO "Account" ("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") VALUES ('cmc8c4bkm0002uswoxwse886d', 'cmc8c4bg60000uswocy3so16z', 'oauth', 'google', '107729754896591020280', NULL, '[REDACTED_ACCESS_TOKEN]', 1750640682, 'Bearer', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid', '[REDACTED_ID_TOKEN]', NULL);
INSERT INTO "Account" ("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") VALUES ('cmc8ctwk70002k204ahdrsozq', 'cmc8ctwds0000k2042urmfrna', 'oauth', 'google', '109666416515928009279', NULL, '[REDACTED_ACCESS_TOKEN]', 1750641876, 'Bearer', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid', '[REDACTED_ID_TOKEN]', NULL);
INSERT INTO "Account" ("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") VALUES ('cmc95ce2l0002l4046ui2c7si', 'cmc95cdvy0000l404np04v7hc', 'oauth', 'google', '108359134625676113108', NULL, '[REDACTED_ACCESS_TOKEN]', 1750689768, 'Bearer', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid', '[REDACTED_ID_TOKEN]', NULL);

-- Data for table: Session
-- Records found: 0
-- No data found in Session

-- Data for table: VerificationToken
-- Records found: 0
-- No data found in VerificationToken

-- Data for table: alerts
-- Records found: 0
-- No data found in alerts

-- Data for table: categories
-- Records found: 0
-- No data found in categories

-- Data for table: movements
-- Records found: 30
DELETE FROM "movements";
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmc8cr4rd0003l80400xec6j6', 'IN', 10, '', '2025-06-23T00:00:00.000Z', 'cmc8cqtcs0001l804ldg4zcqa', 'cmc8c4bg60000uswocy3so16z', '2025-06-23T00:22:28.825Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgsw5l90001jr0apuyv21t6', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgsuo0p0001l4043v6jnrqs', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:16:26.446Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgtv4ay0007jn048sd8rydg', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgtp1ae0005jr0a7eg3xhgb', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:43:37.738Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgtvpek0009jn04s71b52vi', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgsxjlk0003jr0a3bwqqizl', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:44:05.085Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgtwjj9000bjn04h2vb8k6v', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgtt4ye0001jn047r49vos0', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:44:44.133Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgtwws3000djn04cnhvm50k', 'IN', 6, '', '2025-06-28T00:00:00.000Z', 'cmcgttrtr0003jn04rllnmjfr', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:45:01.299Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu117t000pjn0457xyks8t', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgtyfgd000fjn04io8766he', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:48:13.674Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu1cwu000rjn04fcljs5ty', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgtz3gi000hjn04yfgkwwe2', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:48:28.831Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu1r5r000tjn045y337ugp', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgtzn1b000jjn04v1dkl9nw', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:48:47.295Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu2hj0000vjn04v1ljohcc', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgu04u5000ljn042z537q21', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:49:21.469Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu2wv8000xjn04me67lwp5', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgu0kzf000njn041ntj8k3w', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:49:41.348Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu9a3n0019jn04trnndz9q', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgu4xs2000zjn04ypcqd653', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:54:38.435Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgu9o65001bjn042bj5qwnu', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgu62vv0011jn04a3auu802', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:54:56.669Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgua5kj001djn049o73ezhp', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgu6lu90013jn04wq5pey0p', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:55:19.220Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcguamhm001fjn04ipmjxssa', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgu82og0015jn04uf0u5m15', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:55:41.146Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgub759001hjn04gs2j9r2v', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgu8mnb0017jn04yy3arb2c', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T22:56:07.918Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgum2ns001tjn04x8g0z6cy', 'IN', 5, '', '2025-06-28T00:00:00.000Z', 'cmcgujgvw001jjn04ljfp87fz', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:04:35.321Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgumea1001vjn04qlqo5q6o', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgujzed001ljn042fhzkbt0', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:04:50.377Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgumpch001xjn04okra0qnf', 'IN', 12, '', '2025-06-28T00:00:00.000Z', 'cmcgukgt0001njn04rf6z41zt', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:05:04.722Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgun6iq001zjn041skjkvll', 'IN', 6, '', '2025-06-28T00:00:00.000Z', 'cmcgukxxq001pjn04nd7fjijv', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:05:26.978Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgv4k2a002bjn04lzwadg3u', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv0abe0021jn0488mztrpm', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:18:57.682Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgv4tzy002djn04h42vqevh', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv1jns0023jn04xbwc3hc8', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:19:10.558Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgv53mw002fjn04y3cnn2ff', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv2q730025jn04gggw869x', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:19:23.049Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgv5f6z002hjn04wtv8nq2h', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv3fte0027jn04yildmeg1', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:19:38.027Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgv5pbd002jjn04bcuvfj3i', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv3wo10029jn042e24pg7u', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:19:51.145Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgvb4cj002vjn04rlnod803', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv7vaa002ljn04wqtwub8c', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:24:03.907Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgvbf48002xjn04ctk4xsfy', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv8c0c002njn04mxwkihv8', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:24:17.865Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgvcu02002zjn04dgqpch5w', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv8y7t002pjn04tbi0m46d', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:25:23.810Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgvd4yi0031jn04sga9vlg3', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgv9j9v002rjn04qt0olpkq', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:25:38.010Z');
INSERT INTO "movements" ("id", "type", "quantity", "description", "date", "productId", "userId", "createdAt") VALUES ('cmcgvdf6w0033jn04k7h5yfmb', 'IN', 2, '', '2025-06-28T00:00:00.000Z', 'cmcgva50s002tjn04pend2i6c', 'cmc95cdvy0000l404np04v7hc', '2025-06-28T23:25:51.273Z');

-- Data for table: products
-- Records found: 32
DELETE FROM "products";
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgtujn20005jn04aobq9uid', 'RRBLAXXXL', 'REMERA CUELLO REDONDO BLANCA TALLE (XXXL)', '', 'unidad', 4, 0, NULL, true, '2025-06-28T22:43:10.958Z', '2025-06-28T23:07:14.077Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmc8cqtcs0001l804ldg4zcqa', '123123123', 'Camiseta', '', 'unidad', 0, 10, NULL, false, '2025-06-23T00:22:14.044Z', '2025-06-23T00:24:47.818Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgulf5o001rjn04hnc20278', 'RRARXXXL', 'REMERA CUELLO REDONDO ARENA TALLE (XXXL)', '', 'unidad', 4, 0, NULL, true, '2025-06-28T23:04:04.860Z', '2025-06-28T23:07:31.391Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgsuo0p0001l4043v6jnrqs', 'RRBLAM', 'REMERA CUELLO REDONDO BLANCA TALLE M', '', 'unidad', 10, 5, NULL, false, '2025-06-28T22:15:17.017Z', '2025-06-28T22:19:33.586Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgtp1ae0005jr0a7eg3xhgb', 'RRBLAm', 'REMERA CUELLO REDONDO BLANCA TALLE (M)', '', 'unidad', 10, 5, NULL, true, '2025-06-28T22:38:53.894Z', '2025-06-28T22:43:38.664Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgsxjlk0003jr0a3bwqqizl', 'RRBLAL', 'REMERA CUELLO REDONDO BLANCA TALLE (L)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:17:31.256Z', '2025-06-28T22:44:06.015Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgtt4ye0001jn047r49vos0', 'RRBLAXL', 'REMERA CUELLO REDONDO BLANCA TALLE (XL)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:42:05.270Z', '2025-06-28T22:44:44.599Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgttrtr0003jn04rllnmjfr', 'RRBLAXXL', 'REMERA CUELLO REDONDO BLANCA TALLE (XXL)', '', 'unidad', 10, 6, NULL, true, '2025-06-28T22:42:34.911Z', '2025-06-28T22:45:01.765Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgtyfgd000fjn04io8766he', 'RRNEGM', 'REMERA CUELLO REDONDO NEGRA TALLE (M)', '', 'unidad', 10, 5, NULL, true, '2025-06-28T22:46:12.158Z', '2025-06-28T22:48:14.140Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgtz3gi000hjn04yfgkwwe2', 'RRNEGL', 'REMERA CUELLO REDONDO NEGRA TALLE (L)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:46:43.267Z', '2025-06-28T22:48:29.297Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgtzn1b000jjn04v1dkl9nw', 'RRNEGXL', 'REMERA CUELLO REDONDO NEGRA TALLE (XL)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:47:08.639Z', '2025-06-28T22:48:47.761Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu04u5000ljn042z537q21', 'RRNEGXXL', 'REMERA CUELLO REDONDO NEGRA TALLE (XXL)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:47:31.709Z', '2025-06-28T22:49:22.368Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu0kzf000njn041ntj8k3w', 'RRNEGXXXL', 'REMERA CUELLO REDONDO NEGRA TALLE (XXXL)', '', 'unidad', 10, 5, NULL, true, '2025-06-28T22:47:52.636Z', '2025-06-28T22:49:41.800Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu4xs2000zjn04ypcqd653', 'RRGMELM', 'REMERA CUELLO REDONDO GRIS MELANGE TALLE (M)', '', 'unidad', 10, 5, NULL, true, '2025-06-28T22:51:15.842Z', '2025-06-28T22:54:39.341Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu62vv0011jn04a3auu802', 'RRGMELL', 'REMERA CUELLO REDONDO GRIS MELANGE TALLE (L)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:52:09.116Z', '2025-06-28T22:54:57.123Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu6lu90013jn04wq5pey0p', 'RRGMELXL', 'REMERA CUELLO REDONDO GRIS MELANGE TALLE (XL)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:52:33.682Z', '2025-06-28T22:55:19.675Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu82og0015jn04uf0u5m15', 'RRGMELXXL', 'REMERA CUELLO REDONDO GRIS MELANGE TALLE (XXL)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T22:53:42.160Z', '2025-06-28T22:55:41.600Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgu8mnb0017jn04yy3arb2c', 'RRGMELXXXL', 'REMERA CUELLO REDONDO GRIS MELANGE TALLE (XXXL)', '', 'unidad', 10, 5, NULL, true, '2025-06-28T22:54:08.040Z', '2025-06-28T22:56:08.373Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgujgvw001jjn04ljfp87fz', 'RRARM', 'REMERA CUELLO REDONDO ARENA TALLE (M)', '', 'unidad', 10, 5, NULL, true, '2025-06-28T23:02:33.788Z', '2025-06-28T23:04:36.248Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgujzed001ljn042fhzkbt0', 'RRARL', 'REMERA CUELLO REDONDO ARENA TALLE (L)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T23:02:57.782Z', '2025-06-28T23:04:50.842Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgukgt0001njn04rf6z41zt', 'RRARXL', 'REMERA CUELLO REDONDO ARENA TALLE (XL)', '', 'unidad', 10, 12, NULL, true, '2025-06-28T23:03:20.341Z', '2025-06-28T23:05:05.193Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgukxxq001pjn04nd7fjijv', 'RRARXXL', 'REMERA CUELLO REDONDO ARENA TALLE (XXL)', '', 'unidad', 10, 6, NULL, true, '2025-06-28T23:03:42.542Z', '2025-06-28T23:05:27.909Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv0abe0021jn0488mztrpm', 'JCELNEG42', 'JOGGER CARGO ELASTIZADO NEGRO TALLE (42)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:15:38.426Z', '2025-06-28T23:18:58.626Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv1jns0023jn04xbwc3hc8', 'JCELNEG44', 'JOGGER CARGO ELASTIZADO NEGRO TALLE (44)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:16:37.192Z', '2025-06-28T23:19:11.023Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv2q730025jn04gggw869x', 'JCELNEG46', 'JOGGER CARGO ELASTIZADO NEGRO TALLE (46)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:17:32.319Z', '2025-06-28T23:19:23.982Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv3fte0027jn04yildmeg1', 'JCELNEG48', 'JOGGER CARGO ELASTIZADO NEGRO TALLE (48)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:18:05.522Z', '2025-06-28T23:19:38.495Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv3wo10029jn042e24pg7u', 'JCELNEG50', 'JOGGER CARGO ELASTIZADO NEGRO TALLE (50)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:18:27.362Z', '2025-06-28T23:19:51.613Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv7vaa002ljn04wqtwub8c', 'JCELCRE42', 'JOGGER CARGO ELASTIZADO CREMA TALLE (42)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:21:32.195Z', '2025-06-28T23:24:04.375Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv8c0c002njn04mxwkihv8', 'JCELCRE44', 'JOGGER CARGO ELASTIZADO CREMA TALLE (44)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:21:53.868Z', '2025-06-28T23:24:18.334Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv8y7t002pjn04tbi0m46d', 'JCELCRE46', 'JOGGER CARGO ELASTIZADO CREMA TALLE (46)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:22:22.649Z', '2025-06-28T23:25:24.746Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgv9j9v002rjn04qt0olpkq', 'JCELCRE48', 'JOGGER CARGO ELASTIZADO CREMA TALLE (48)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:22:49.939Z', '2025-06-28T23:25:38.479Z');
INSERT INTO "products" ("id", "code", "name", "description", "unit", "minStock", "currentStock", "categoryId", "isActive", "createdAt", "updatedAt") VALUES ('cmcgva50s002tjn04pend2i6c', 'JCELCRE50', 'JOGGER CARGO ELASTIZADO CREMA TALLE (50)', '', 'unidad', 5, 2, NULL, true, '2025-06-28T23:23:18.124Z', '2025-06-28T23:25:51.742Z');

-- Data for table: users
-- Records found: 3
DELETE FROM "users";
INSERT INTO "users" ("id", "name", "email", "emailVerified", "image", "role", "createdAt", "updatedAt") VALUES ('cmc8c4bg60000uswocy3so16z', 'Yoel Muler', 'yoelmuler@gmail.com', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKPKoAsCj7P98a2Byx0hmFNQzQKcpz1hzbjl3DMQcRJoW5gg7El=s96-c', 'OPERATOR', '2025-06-23T00:04:44.406Z', '2025-06-23T00:04:44.406Z');
INSERT INTO "users" ("id", "name", "email", "emailVerified", "image", "role", "createdAt", "updatedAt") VALUES ('cmc8ctwds0000k2042urmfrna', 'Ian Muler', 'ianymuler@gmail.com', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJrs9CO8OfOSTBndK9HL0Ja2TZEJ1tUJF3QHXGlIrAoB3UFhw=s96-c', 'OPERATOR', '2025-06-23T00:24:37.937Z', '2025-06-23T00:24:37.937Z');
INSERT INTO "users" ("id", "name", "email", "emailVerified", "image", "role", "createdAt", "updatedAt") VALUES ('cmc95cdvy0000l404np04v7hc', 'Tetelestai Indumentaria', 'tetelestai.indumentaria@gmail.com', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJWxm-ohwZ-wU7UR0kN5Vegd9cT0V5yi7GXQYSfuLLSJKby8Q=s96-c', 'OPERATOR', '2025-06-23T13:42:49.678Z', '2025-06-23T13:42:49.678Z');

-- Re-enable triggers
SET session_replication_role = DEFAULT;
