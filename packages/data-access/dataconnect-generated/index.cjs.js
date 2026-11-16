const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const BranchStatus = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
}
exports.BranchStatus = BranchStatus;

const MembershipStatus = {
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
}
exports.MembershipStatus = MembershipStatus;

const OrderItemStatus = {
  RECEIVED: "RECEIVED",
  IN_PREPARATION: "IN_PREPARATION",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
}
exports.OrderItemStatus = OrderItemStatus;

const OrderQuoteStatus = {
  QUOTED: "QUOTED",
  AUTHORIZED: "AUTHORIZED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
  RELEASE_PENDING: "RELEASE_PENDING",
}
exports.OrderQuoteStatus = OrderQuoteStatus;

const ServiceRequestKind = {
  CALL_WAITER: "CALL_WAITER",
  REQUEST_BILL: "REQUEST_BILL",
}
exports.ServiceRequestKind = ServiceRequestKind;

const connectorConfig = {
  connector: 'tavelyo',
  service: 'tavelyo',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const catalogAdminRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'CatalogAdmin', inputVars);
}
catalogAdminRef.operationName = 'CatalogAdmin';
exports.catalogAdminRef = catalogAdminRef;

exports.catalogAdmin = function catalogAdmin(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(catalogAdminRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const branchCatalogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'BranchCatalog', inputVars);
}
branchCatalogRef.operationName = 'BranchCatalog';
exports.branchCatalogRef = branchCatalogRef;

exports.branchCatalog = function branchCatalog(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(branchCatalogRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createTaxRuleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTaxRule', inputVars);
}
createTaxRuleRef.operationName = 'CreateTaxRule';
exports.createTaxRuleRef = createTaxRuleRef;

exports.createTaxRule = function createTaxRule(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createTaxRuleRef(dcInstance, inputVars));
}
;

const updateTaxRuleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaxRule', inputVars);
}
updateTaxRuleRef.operationName = 'UpdateTaxRule';
exports.updateTaxRuleRef = updateTaxRuleRef;

exports.updateTaxRule = function updateTaxRule(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateTaxRuleRef(dcInstance, inputVars));
}
;

const createCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCategory', inputVars);
}
createCategoryRef.operationName = 'CreateCategory';
exports.createCategoryRef = createCategoryRef;

exports.createCategory = function createCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCategoryRef(dcInstance, inputVars));
}
;

const updateCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateCategory', inputVars);
}
updateCategoryRef.operationName = 'UpdateCategory';
exports.updateCategoryRef = updateCategoryRef;

exports.updateCategory = function updateCategory(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateCategoryRef(dcInstance, inputVars));
}
;

const createProductRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateProduct', inputVars);
}
createProductRef.operationName = 'CreateProduct';
exports.createProductRef = createProductRef;

exports.createProduct = function createProduct(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createProductRef(dcInstance, inputVars));
}
;

const updateProductRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateProduct', inputVars);
}
updateProductRef.operationName = 'UpdateProduct';
exports.updateProductRef = updateProductRef;

exports.updateProduct = function updateProduct(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateProductRef(dcInstance, inputVars));
}
;

const createModifierGroupRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateModifierGroup', inputVars);
}
createModifierGroupRef.operationName = 'CreateModifierGroup';
exports.createModifierGroupRef = createModifierGroupRef;

exports.createModifierGroup = function createModifierGroup(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createModifierGroupRef(dcInstance, inputVars));
}
;

const updateModifierGroupRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateModifierGroup', inputVars);
}
updateModifierGroupRef.operationName = 'UpdateModifierGroup';
exports.updateModifierGroupRef = updateModifierGroupRef;

exports.updateModifierGroup = function updateModifierGroup(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateModifierGroupRef(dcInstance, inputVars));
}
;

const createModifierOptionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateModifierOption', inputVars);
}
createModifierOptionRef.operationName = 'CreateModifierOption';
exports.createModifierOptionRef = createModifierOptionRef;

exports.createModifierOption = function createModifierOption(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createModifierOptionRef(dcInstance, inputVars));
}
;

const updateModifierOptionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateModifierOption', inputVars);
}
updateModifierOptionRef.operationName = 'UpdateModifierOption';
exports.updateModifierOptionRef = updateModifierOptionRef;

exports.updateModifierOption = function updateModifierOption(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateModifierOptionRef(dcInstance, inputVars));
}
;

const setProductAvailabilityRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetProductAvailability', inputVars);
}
setProductAvailabilityRef.operationName = 'SetProductAvailability';
exports.setProductAvailabilityRef = setProductAvailabilityRef;

exports.setProductAvailability = function setProductAvailability(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setProductAvailabilityRef(dcInstance, inputVars));
}
;

const changePriceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ChangePrice', inputVars);
}
changePriceRef.operationName = 'ChangePrice';
exports.changePriceRef = changePriceRef;

exports.changePrice = function changePrice(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(changePriceRef(dcInstance, inputVars));
}
;

const publicMenuRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PublicMenu', inputVars);
}
publicMenuRef.operationName = 'PublicMenu';
exports.publicMenuRef = publicMenuRef;

exports.publicMenu = function publicMenu(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(publicMenuRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const myParticipationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyParticipation', inputVars);
}
myParticipationRef.operationName = 'MyParticipation';
exports.myParticipationRef = myParticipationRef;

exports.myParticipation = function myParticipation(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(myParticipationRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const myOrdersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyOrders', inputVars);
}
myOrdersRef.operationName = 'MyOrders';
exports.myOrdersRef = myOrdersRef;

exports.myOrders = function myOrders(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(myOrdersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const branchStationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'BranchStations', inputVars);
}
branchStationsRef.operationName = 'BranchStations';
exports.branchStationsRef = branchStationsRef;

exports.branchStations = function branchStations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(branchStationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createStationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateStation', inputVars);
}
createStationRef.operationName = 'CreateStation';
exports.createStationRef = createStationRef;

exports.createStation = function createStation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createStationRef(dcInstance, inputVars));
}
;

const updateStationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateStation', inputVars);
}
updateStationRef.operationName = 'UpdateStation';
exports.updateStationRef = updateStationRef;

exports.updateStation = function updateStation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateStationRef(dcInstance, inputVars));
}
;

const setProductStationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetProductStation', inputVars);
}
setProductStationRef.operationName = 'SetProductStation';
exports.setProductStationRef = setProductStationRef;

exports.setProductStation = function setProductStation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setProductStationRef(dcInstance, inputVars));
}
;

const kitchenStationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'KitchenStations', inputVars);
}
kitchenStationsRef.operationName = 'KitchenStations';
exports.kitchenStationsRef = kitchenStationsRef;

exports.kitchenStations = function kitchenStations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(kitchenStationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const kitchenQueueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'KitchenQueue', inputVars);
}
kitchenQueueRef.operationName = 'KitchenQueue';
exports.kitchenQueueRef = kitchenQueueRef;

exports.kitchenQueue = function kitchenQueue(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(kitchenQueueRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const startOrderItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'StartOrderItem', inputVars);
}
startOrderItemRef.operationName = 'StartOrderItem';
exports.startOrderItemRef = startOrderItemRef;

exports.startOrderItem = function startOrderItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(startOrderItemRef(dcInstance, inputVars));
}
;

const finishOrderItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'FinishOrderItem', inputVars);
}
finishOrderItemRef.operationName = 'FinishOrderItem';
exports.finishOrderItemRef = finishOrderItemRef;

exports.finishOrderItem = function finishOrderItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(finishOrderItemRef(dcInstance, inputVars));
}
;

const branchLayoutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'BranchLayout', inputVars);
}
branchLayoutRef.operationName = 'BranchLayout';
exports.branchLayoutRef = branchLayoutRef;

exports.branchLayout = function branchLayout(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(branchLayoutRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createSectorRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSector', inputVars);
}
createSectorRef.operationName = 'CreateSector';
exports.createSectorRef = createSectorRef;

exports.createSector = function createSector(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createSectorRef(dcInstance, inputVars));
}
;

const updateSectorRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateSector', inputVars);
}
updateSectorRef.operationName = 'UpdateSector';
exports.updateSectorRef = updateSectorRef;

exports.updateSector = function updateSector(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateSectorRef(dcInstance, inputVars));
}
;

const createTableRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTable', inputVars);
}
createTableRef.operationName = 'CreateTable';
exports.createTableRef = createTableRef;

exports.createTable = function createTable(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createTableRef(dcInstance, inputVars));
}
;

const updateTableRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTable', inputVars);
}
updateTableRef.operationName = 'UpdateTable';
exports.updateTableRef = updateTableRef;

exports.updateTable = function updateTable(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateTableRef(dcInstance, inputVars));
}
;

const rotateTableQrRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RotateTableQr', inputVars);
}
rotateTableQrRef.operationName = 'RotateTableQr';
exports.rotateTableQrRef = rotateTableQrRef;

exports.rotateTableQr = function rotateTableQr(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(rotateTableQrRef(dcInstance, inputVars));
}
;

const upsertMyProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertMyProfile', inputVars);
}
upsertMyProfileRef.operationName = 'UpsertMyProfile';
exports.upsertMyProfileRef = upsertMyProfileRef;

exports.upsertMyProfile = function upsertMyProfile(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertMyProfileRef(dcInstance, inputVars));
}
;

const addMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddMember', inputVars);
}
addMemberRef.operationName = 'AddMember';
exports.addMemberRef = addMemberRef;

exports.addMember = function addMember(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addMemberRef(dcInstance, inputVars));
}
;

const changeMemberRoleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ChangeMemberRole', inputVars);
}
changeMemberRoleRef.operationName = 'ChangeMemberRole';
exports.changeMemberRoleRef = changeMemberRoleRef;

exports.changeMemberRole = function changeMemberRole(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(changeMemberRoleRef(dcInstance, inputVars));
}
;

const revokeMemberRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RevokeMember', inputVars);
}
revokeMemberRef.operationName = 'RevokeMember';
exports.revokeMemberRef = revokeMemberRef;

exports.revokeMember = function revokeMember(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(revokeMemberRef(dcInstance, inputVars));
}
;

const assignMemberBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignMemberBranch', inputVars);
}
assignMemberBranchRef.operationName = 'AssignMemberBranch';
exports.assignMemberBranchRef = assignMemberBranchRef;

exports.assignMemberBranch = function assignMemberBranch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(assignMemberBranchRef(dcInstance, inputVars));
}
;

const unassignMemberBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UnassignMemberBranch', inputVars);
}
unassignMemberBranchRef.operationName = 'UnassignMemberBranch';
exports.unassignMemberBranchRef = unassignMemberBranchRef;

exports.unassignMemberBranch = function unassignMemberBranch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(unassignMemberBranchRef(dcInstance, inputVars));
}
;

const pickupQueueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PickupQueue', inputVars);
}
pickupQueueRef.operationName = 'PickupQueue';
exports.pickupQueueRef = pickupQueueRef;

exports.pickupQueue = function pickupQueue(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(pickupQueueRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const sessionOrdersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SessionOrders', inputVars);
}
sessionOrdersRef.operationName = 'SessionOrders';
exports.sessionOrdersRef = sessionOrdersRef;

exports.sessionOrders = function sessionOrders(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(sessionOrdersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const pickUpOrderItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'PickUpOrderItem', inputVars);
}
pickUpOrderItemRef.operationName = 'PickUpOrderItem';
exports.pickUpOrderItemRef = pickUpOrderItemRef;

exports.pickUpOrderItem = function pickUpOrderItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(pickUpOrderItemRef(dcInstance, inputVars));
}
;

const deliverOrderItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeliverOrderItem', inputVars);
}
deliverOrderItemRef.operationName = 'DeliverOrderItem';
exports.deliverOrderItemRef = deliverOrderItemRef;

exports.deliverOrderItem = function deliverOrderItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deliverOrderItemRef(dcInstance, inputVars));
}
;

const deliverOrderItemDirectlyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeliverOrderItemDirectly', inputVars);
}
deliverOrderItemDirectlyRef.operationName = 'DeliverOrderItemDirectly';
exports.deliverOrderItemDirectlyRef = deliverOrderItemDirectlyRef;

exports.deliverOrderItemDirectly = function deliverOrderItemDirectly(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(deliverOrderItemDirectlyRef(dcInstance, inputVars));
}
;

const cancelOrderItemRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CancelOrderItem', inputVars);
}
cancelOrderItemRef.operationName = 'CancelOrderItem';
exports.cancelOrderItemRef = cancelOrderItemRef;

exports.cancelOrderItem = function cancelOrderItem(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(cancelOrderItemRef(dcInstance, inputVars));
}
;

const pendingServiceRequestsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PendingServiceRequests', inputVars);
}
pendingServiceRequestsRef.operationName = 'PendingServiceRequests';
exports.pendingServiceRequestsRef = pendingServiceRequestsRef;

exports.pendingServiceRequests = function pendingServiceRequests(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(pendingServiceRequestsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const attendServiceRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AttendServiceRequest', inputVars);
}
attendServiceRequestRef.operationName = 'AttendServiceRequest';
exports.attendServiceRequestRef = attendServiceRequestRef;

exports.attendServiceRequest = function attendServiceRequest(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(attendServiceRequestRef(dcInstance, inputVars));
}
;

const myProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyProfile');
}
myProfileRef.operationName = 'MyProfile';
exports.myProfileRef = myProfileRef;

exports.myProfile = function myProfile(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myProfileRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const myMembershipsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyMemberships');
}
myMembershipsRef.operationName = 'MyMemberships';
exports.myMembershipsRef = myMembershipsRef;

exports.myMemberships = function myMemberships(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myMembershipsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const myBranchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyBranches', inputVars);
}
myBranchesRef.operationName = 'MyBranches';
exports.myBranchesRef = myBranchesRef;

exports.myBranches = function myBranches(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(myBranchesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const tenantMembersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'TenantMembers', inputVars);
}
tenantMembersRef.operationName = 'TenantMembers';
exports.tenantMembersRef = tenantMembersRef;

exports.tenantMembers = function tenantMembers(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(tenantMembersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const tenantAuditEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'TenantAuditEvents', inputVars);
}
tenantAuditEventsRef.operationName = 'TenantAuditEvents';
exports.tenantAuditEventsRef = tenantAuditEventsRef;

exports.tenantAuditEvents = function tenantAuditEvents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(tenantAuditEventsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const floorViewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'FloorView', inputVars);
}
floorViewRef.operationName = 'FloorView';
exports.floorViewRef = floorViewRef;

exports.floorView = function floorView(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(floorViewRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const sessionParticipantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SessionParticipants', inputVars);
}
sessionParticipantsRef.operationName = 'SessionParticipants';
exports.sessionParticipantsRef = sessionParticipantsRef;

exports.sessionParticipants = function sessionParticipants(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(sessionParticipantsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const openTableSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'OpenTableSession', inputVars);
}
openTableSessionRef.operationName = 'OpenTableSession';
exports.openTableSessionRef = openTableSessionRef;

exports.openTableSession = function openTableSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(openTableSessionRef(dcInstance, inputVars));
}
;

const closeTableSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CloseTableSession', inputVars);
}
closeTableSessionRef.operationName = 'CloseTableSession';
exports.closeTableSessionRef = closeTableSessionRef;

exports.closeTableSession = function closeTableSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(closeTableSessionRef(dcInstance, inputVars));
}
;

const removeParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RemoveParticipant', inputVars);
}
removeParticipantRef.operationName = 'RemoveParticipant';
exports.removeParticipantRef = removeParticipantRef;

exports.removeParticipant = function removeParticipant(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(removeParticipantRef(dcInstance, inputVars));
}
;

const serverOpenSessionByQrRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerOpenSessionByQr', inputVars);
}
serverOpenSessionByQrRef.operationName = 'ServerOpenSessionByQr';
exports.serverOpenSessionByQrRef = serverOpenSessionByQrRef;

exports.serverOpenSessionByQr = function serverOpenSessionByQr(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverOpenSessionByQrRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverInsertParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerInsertParticipant', inputVars);
}
serverInsertParticipantRef.operationName = 'ServerInsertParticipant';
exports.serverInsertParticipantRef = serverInsertParticipantRef;

exports.serverInsertParticipant = function serverInsertParticipant(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverInsertParticipantRef(dcInstance, inputVars));
}
;

const serverRenewParticipantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerRenewParticipant', inputVars);
}
serverRenewParticipantRef.operationName = 'ServerRenewParticipant';
exports.serverRenewParticipantRef = serverRenewParticipantRef;

exports.serverRenewParticipant = function serverRenewParticipant(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverRenewParticipantRef(dcInstance, inputVars));
}
;

const serverQuoteContextRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerQuoteContext', inputVars);
}
serverQuoteContextRef.operationName = 'ServerQuoteContext';
exports.serverQuoteContextRef = serverQuoteContextRef;

exports.serverQuoteContext = function serverQuoteContext(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverQuoteContextRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverProductsForQuoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerProductsForQuote', inputVars);
}
serverProductsForQuoteRef.operationName = 'ServerProductsForQuote';
exports.serverProductsForQuoteRef = serverProductsForQuoteRef;

exports.serverProductsForQuote = function serverProductsForQuote(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverProductsForQuoteRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverQuoteByKeyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerQuoteByKey', inputVars);
}
serverQuoteByKeyRef.operationName = 'ServerQuoteByKey';
exports.serverQuoteByKeyRef = serverQuoteByKeyRef;

exports.serverQuoteByKey = function serverQuoteByKey(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverQuoteByKeyRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverQuoteForPaymentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerQuoteForPayment', inputVars);
}
serverQuoteForPaymentRef.operationName = 'ServerQuoteForPayment';
exports.serverQuoteForPaymentRef = serverQuoteForPaymentRef;

exports.serverQuoteForPayment = function serverQuoteForPayment(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverQuoteForPaymentRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverSetQuotePaymentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSetQuotePayment', inputVars);
}
serverSetQuotePaymentRef.operationName = 'ServerSetQuotePayment';
exports.serverSetQuotePaymentRef = serverSetQuotePaymentRef;

exports.serverSetQuotePayment = function serverSetQuotePayment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSetQuotePaymentRef(dcInstance, inputVars));
}
;

const serverHitRateLimitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerHitRateLimit', inputVars);
}
serverHitRateLimitRef.operationName = 'ServerHitRateLimit';
exports.serverHitRateLimitRef = serverHitRateLimitRef;

exports.serverHitRateLimit = function serverHitRateLimit(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverHitRateLimitRef(dcInstance, inputVars));
}
;

const serverOrderByQuoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerOrderByQuote', inputVars);
}
serverOrderByQuoteRef.operationName = 'ServerOrderByQuote';
exports.serverOrderByQuoteRef = serverOrderByQuoteRef;

exports.serverOrderByQuote = function serverOrderByQuote(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverOrderByQuoteRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverStationsForOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerStationsForOrder', inputVars);
}
serverStationsForOrderRef.operationName = 'ServerStationsForOrder';
exports.serverStationsForOrderRef = serverStationsForOrderRef;

exports.serverStationsForOrder = function serverStationsForOrder(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverStationsForOrderRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverCreateDefaultStationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerCreateDefaultStation', inputVars);
}
serverCreateDefaultStationRef.operationName = 'ServerCreateDefaultStation';
exports.serverCreateDefaultStationRef = serverCreateDefaultStationRef;

exports.serverCreateDefaultStation = function serverCreateDefaultStation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverCreateDefaultStationRef(dcInstance, inputVars));
}
;

const serverSendOrderToKitchenRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSendOrderToKitchen', inputVars);
}
serverSendOrderToKitchenRef.operationName = 'ServerSendOrderToKitchen';
exports.serverSendOrderToKitchenRef = serverSendOrderToKitchenRef;

exports.serverSendOrderToKitchen = function serverSendOrderToKitchen(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSendOrderToKitchenRef(dcInstance, inputVars));
}
;

const serverCreateServiceRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerCreateServiceRequest', inputVars);
}
serverCreateServiceRequestRef.operationName = 'ServerCreateServiceRequest';
exports.serverCreateServiceRequestRef = serverCreateServiceRequestRef;

exports.serverCreateServiceRequest = function serverCreateServiceRequest(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverCreateServiceRequestRef(dcInstance, inputVars));
}
;

const tenantBranchesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'TenantBranches', inputVars);
}
tenantBranchesRef.operationName = 'TenantBranches';
exports.tenantBranchesRef = tenantBranchesRef;

exports.tenantBranches = function tenantBranches(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(tenantBranchesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateBranch', inputVars);
}
createBranchRef.operationName = 'CreateBranch';
exports.createBranchRef = createBranchRef;

exports.createBranch = function createBranch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createBranchRef(dcInstance, inputVars));
}
;

const updateBranchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateBranch', inputVars);
}
updateBranchRef.operationName = 'UpdateBranch';
exports.updateBranchRef = updateBranchRef;

exports.updateBranch = function updateBranch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateBranchRef(dcInstance, inputVars));
}
;
