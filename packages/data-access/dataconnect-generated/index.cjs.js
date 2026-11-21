const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const AuthorizationStatus = {
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  VOIDED: "VOIDED",
  EXPIRED: "EXPIRED",
}
exports.AuthorizationStatus = AuthorizationStatus;

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

const OrderApproval = {
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
}
exports.OrderApproval = OrderApproval;

const OrderApprovalMode = {
  DIRECT: "DIRECT",
  WAITER_APPROVAL: "WAITER_APPROVAL",
}
exports.OrderApprovalMode = OrderApprovalMode;

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
  CONFIRMED: "CONFIRMED",
  AUTHORIZED: "AUTHORIZED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
  RELEASE_PENDING: "RELEASE_PENDING",
}
exports.OrderQuoteStatus = OrderQuoteStatus;

const PaymentOperationKind = {
  AUTHORIZE: "AUTHORIZE",
  CAPTURE: "CAPTURE",
  VOID: "VOID",
  REFUND: "REFUND",
  CHARGE: "CHARGE",
}
exports.PaymentOperationKind = PaymentOperationKind;

const PaymentOperationStatus = {
  CREATED: "CREATED",
  PROCESSING: "PROCESSING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  UNKNOWN: "UNKNOWN",
}
exports.PaymentOperationStatus = PaymentOperationStatus;

const ServiceRequestKind = {
  CALL_WAITER: "CALL_WAITER",
  REQUEST_BILL: "REQUEST_BILL",
}
exports.ServiceRequestKind = ServiceRequestKind;

const TableSessionStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
}
exports.TableSessionStatus = TableSessionStatus;

const connectorConfig = {
  connector: 'tavelyo',
  service: 'tavelyo',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const branchOrderApprovalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'BranchOrderApproval', inputVars);
}
branchOrderApprovalRef.operationName = 'BranchOrderApproval';
exports.branchOrderApprovalRef = branchOrderApprovalRef;

exports.branchOrderApproval = function branchOrderApproval(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(branchOrderApprovalRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const setBranchOrderApprovalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetBranchOrderApproval', inputVars);
}
setBranchOrderApprovalRef.operationName = 'SetBranchOrderApproval';
exports.setBranchOrderApprovalRef = setBranchOrderApprovalRef;

exports.setBranchOrderApproval = function setBranchOrderApproval(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setBranchOrderApprovalRef(dcInstance, inputVars));
}
;

const pendingApprovalOrdersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'PendingApprovalOrders', inputVars);
}
pendingApprovalOrdersRef.operationName = 'PendingApprovalOrders';
exports.pendingApprovalOrdersRef = pendingApprovalOrdersRef;

exports.pendingApprovalOrders = function pendingApprovalOrders(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(pendingApprovalOrdersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const approveOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ApproveOrder', inputVars);
}
approveOrderRef.operationName = 'ApproveOrder';
exports.approveOrderRef = approveOrderRef;

exports.approveOrder = function approveOrder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(approveOrderRef(dcInstance, inputVars));
}
;

const rejectOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RejectOrder', inputVars);
}
rejectOrderRef.operationName = 'RejectOrder';
exports.rejectOrderRef = rejectOrderRef;

exports.rejectOrder = function rejectOrder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(rejectOrderRef(dcInstance, inputVars));
}
;

const withdrawMyOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'WithdrawMyOrder', inputVars);
}
withdrawMyOrderRef.operationName = 'WithdrawMyOrder';
exports.withdrawMyOrderRef = withdrawMyOrderRef;

exports.withdrawMyOrder = function withdrawMyOrder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(withdrawMyOrderRef(dcInstance, inputVars));
}
;

const branchRegistersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'BranchRegisters', inputVars);
}
branchRegistersRef.operationName = 'BranchRegisters';
exports.branchRegistersRef = branchRegistersRef;

exports.branchRegisters = function branchRegisters(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(branchRegistersRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const createRegisterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRegister', inputVars);
}
createRegisterRef.operationName = 'CreateRegister';
exports.createRegisterRef = createRegisterRef;

exports.createRegister = function createRegister(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createRegisterRef(dcInstance, inputVars));
}
;

const updateRegisterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRegister', inputVars);
}
updateRegisterRef.operationName = 'UpdateRegister';
exports.updateRegisterRef = updateRegisterRef;

exports.updateRegister = function updateRegister(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateRegisterRef(dcInstance, inputVars));
}
;

const billingTablesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'BillingTables', inputVars);
}
billingTablesRef.operationName = 'BillingTables';
exports.billingTablesRef = billingTablesRef;

exports.billingTables = function billingTables(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(billingTablesRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

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

const staffOrderDeskRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'StaffOrderDesk', inputVars);
}
staffOrderDeskRef.operationName = 'StaffOrderDesk';
exports.staffOrderDeskRef = staffOrderDeskRef;

exports.staffOrderDesk = function staffOrderDesk(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(staffOrderDeskRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const addTableGuestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddTableGuest', inputVars);
}
addTableGuestRef.operationName = 'AddTableGuest';
exports.addTableGuestRef = addTableGuestRef;

exports.addTableGuest = function addTableGuest(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addTableGuestRef(dcInstance, inputVars));
}
;

const serverSendStaffOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSendStaffOrder', inputVars);
}
serverSendStaffOrderRef.operationName = 'ServerSendStaffOrder';
exports.serverSendStaffOrderRef = serverSendStaffOrderRef;

exports.serverSendStaffOrder = function serverSendStaffOrder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSendStaffOrderRef(dcInstance, inputVars));
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

const serverPaymentOperationByKeyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerPaymentOperationByKey', inputVars);
}
serverPaymentOperationByKeyRef.operationName = 'ServerPaymentOperationByKey';
exports.serverPaymentOperationByKeyRef = serverPaymentOperationByKeyRef;

exports.serverPaymentOperationByKey = function serverPaymentOperationByKey(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverPaymentOperationByKeyRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverStalePaymentOperationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerStalePaymentOperations', inputVars);
}
serverStalePaymentOperationsRef.operationName = 'ServerStalePaymentOperations';
exports.serverStalePaymentOperationsRef = serverStalePaymentOperationsRef;

exports.serverStalePaymentOperations = function serverStalePaymentOperations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverStalePaymentOperationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverAuthorizationByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerAuthorizationById', inputVars);
}
serverAuthorizationByIdRef.operationName = 'ServerAuthorizationById';
exports.serverAuthorizationByIdRef = serverAuthorizationByIdRef;

exports.serverAuthorizationById = function serverAuthorizationById(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverAuthorizationByIdRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverAuthorizationsToReleaseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerAuthorizationsToRelease', inputVars);
}
serverAuthorizationsToReleaseRef.operationName = 'ServerAuthorizationsToRelease';
exports.serverAuthorizationsToReleaseRef = serverAuthorizationsToReleaseRef;

exports.serverAuthorizationsToRelease = function serverAuthorizationsToRelease(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverAuthorizationsToReleaseRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverExpiringAuthorizationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerExpiringAuthorizations', inputVars);
}
serverExpiringAuthorizationsRef.operationName = 'ServerExpiringAuthorizations';
exports.serverExpiringAuthorizationsRef = serverExpiringAuthorizationsRef;

exports.serverExpiringAuthorizations = function serverExpiringAuthorizations(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverExpiringAuthorizationsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverProviderEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerProviderEvent', inputVars);
}
serverProviderEventRef.operationName = 'ServerProviderEvent';
exports.serverProviderEventRef = serverProviderEventRef;

exports.serverProviderEvent = function serverProviderEvent(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverProviderEventRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverDueOutboxEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerDueOutboxEvents', inputVars);
}
serverDueOutboxEventsRef.operationName = 'ServerDueOutboxEvents';
exports.serverDueOutboxEventsRef = serverDueOutboxEventsRef;

exports.serverDueOutboxEvents = function serverDueOutboxEvents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverDueOutboxEventsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const serverBeginPaymentOperationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerBeginPaymentOperation', inputVars);
}
serverBeginPaymentOperationRef.operationName = 'ServerBeginPaymentOperation';
exports.serverBeginPaymentOperationRef = serverBeginPaymentOperationRef;

exports.serverBeginPaymentOperation = function serverBeginPaymentOperation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverBeginPaymentOperationRef(dcInstance, inputVars));
}
;

const serverRetryPaymentOperationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerRetryPaymentOperation', inputVars);
}
serverRetryPaymentOperationRef.operationName = 'ServerRetryPaymentOperation';
exports.serverRetryPaymentOperationRef = serverRetryPaymentOperationRef;

exports.serverRetryPaymentOperation = function serverRetryPaymentOperation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverRetryPaymentOperationRef(dcInstance, inputVars));
}
;

const serverMarkPaymentOperationUnknownRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerMarkPaymentOperationUnknown', inputVars);
}
serverMarkPaymentOperationUnknownRef.operationName = 'ServerMarkPaymentOperationUnknown';
exports.serverMarkPaymentOperationUnknownRef = serverMarkPaymentOperationUnknownRef;

exports.serverMarkPaymentOperationUnknown = function serverMarkPaymentOperationUnknown(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverMarkPaymentOperationUnknownRef(dcInstance, inputVars));
}
;

const serverFailPaymentOperationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerFailPaymentOperation', inputVars);
}
serverFailPaymentOperationRef.operationName = 'ServerFailPaymentOperation';
exports.serverFailPaymentOperationRef = serverFailPaymentOperationRef;

exports.serverFailPaymentOperation = function serverFailPaymentOperation(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverFailPaymentOperationRef(dcInstance, inputVars));
}
;

const serverSettleAuthorizeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSettleAuthorize', inputVars);
}
serverSettleAuthorizeRef.operationName = 'ServerSettleAuthorize';
exports.serverSettleAuthorizeRef = serverSettleAuthorizeRef;

exports.serverSettleAuthorize = function serverSettleAuthorize(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSettleAuthorizeRef(dcInstance, inputVars));
}
;

const serverDeclineAuthorizeRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerDeclineAuthorize', inputVars);
}
serverDeclineAuthorizeRef.operationName = 'ServerDeclineAuthorize';
exports.serverDeclineAuthorizeRef = serverDeclineAuthorizeRef;

exports.serverDeclineAuthorize = function serverDeclineAuthorize(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverDeclineAuthorizeRef(dcInstance, inputVars));
}
;

const serverAdoptOrphanAuthorizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerAdoptOrphanAuthorization', inputVars);
}
serverAdoptOrphanAuthorizationRef.operationName = 'ServerAdoptOrphanAuthorization';
exports.serverAdoptOrphanAuthorizationRef = serverAdoptOrphanAuthorizationRef;

exports.serverAdoptOrphanAuthorization = function serverAdoptOrphanAuthorization(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverAdoptOrphanAuthorizationRef(dcInstance, inputVars));
}
;

const serverSettleCaptureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSettleCapture', inputVars);
}
serverSettleCaptureRef.operationName = 'ServerSettleCapture';
exports.serverSettleCaptureRef = serverSettleCaptureRef;

exports.serverSettleCapture = function serverSettleCapture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSettleCaptureRef(dcInstance, inputVars));
}
;

const serverFailCaptureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerFailCapture', inputVars);
}
serverFailCaptureRef.operationName = 'ServerFailCapture';
exports.serverFailCaptureRef = serverFailCaptureRef;

exports.serverFailCapture = function serverFailCapture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverFailCaptureRef(dcInstance, inputVars));
}
;

const serverSettleVoidRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSettleVoid', inputVars);
}
serverSettleVoidRef.operationName = 'ServerSettleVoid';
exports.serverSettleVoidRef = serverSettleVoidRef;

exports.serverSettleVoid = function serverSettleVoid(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSettleVoidRef(dcInstance, inputVars));
}
;

const serverExpireAuthorizationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerExpireAuthorization', inputVars);
}
serverExpireAuthorizationRef.operationName = 'ServerExpireAuthorization';
exports.serverExpireAuthorizationRef = serverExpireAuthorizationRef;

exports.serverExpireAuthorization = function serverExpireAuthorization(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverExpireAuthorizationRef(dcInstance, inputVars));
}
;

const serverExpireAuthorizationByRefRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerExpireAuthorizationByRef', inputVars);
}
serverExpireAuthorizationByRefRef.operationName = 'ServerExpireAuthorizationByRef';
exports.serverExpireAuthorizationByRefRef = serverExpireAuthorizationByRefRef;

exports.serverExpireAuthorizationByRef = function serverExpireAuthorizationByRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverExpireAuthorizationByRefRef(dcInstance, inputVars));
}
;

const serverExpireLapsedAuthorizationsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerExpireLapsedAuthorizations', inputVars);
}
serverExpireLapsedAuthorizationsRef.operationName = 'ServerExpireLapsedAuthorizations';
exports.serverExpireLapsedAuthorizationsRef = serverExpireLapsedAuthorizationsRef;

exports.serverExpireLapsedAuthorizations = function serverExpireLapsedAuthorizations(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverExpireLapsedAuthorizationsRef(dcInstance, inputVars));
}
;

const serverSettleRefundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerSettleRefund', inputVars);
}
serverSettleRefundRef.operationName = 'ServerSettleRefund';
exports.serverSettleRefundRef = serverSettleRefundRef;

exports.serverSettleRefund = function serverSettleRefund(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverSettleRefundRef(dcInstance, inputVars));
}
;

const serverMarkRefundPendingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerMarkRefundPending', inputVars);
}
serverMarkRefundPendingRef.operationName = 'ServerMarkRefundPending';
exports.serverMarkRefundPendingRef = serverMarkRefundPendingRef;

exports.serverMarkRefundPending = function serverMarkRefundPending(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverMarkRefundPendingRef(dcInstance, inputVars));
}
;

const serverRejectRefundRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerRejectRefund', inputVars);
}
serverRejectRefundRef.operationName = 'ServerRejectRefund';
exports.serverRejectRefundRef = serverRejectRefundRef;

exports.serverRejectRefund = function serverRejectRefund(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverRejectRefundRef(dcInstance, inputVars));
}
;

const serverRecordProviderEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerRecordProviderEvent', inputVars);
}
serverRecordProviderEventRef.operationName = 'ServerRecordProviderEvent';
exports.serverRecordProviderEventRef = serverRecordProviderEventRef;

exports.serverRecordProviderEvent = function serverRecordProviderEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverRecordProviderEventRef(dcInstance, inputVars));
}
;

const serverFinishProviderEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerFinishProviderEvent', inputVars);
}
serverFinishProviderEventRef.operationName = 'ServerFinishProviderEvent';
exports.serverFinishProviderEventRef = serverFinishProviderEventRef;

exports.serverFinishProviderEvent = function serverFinishProviderEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverFinishProviderEventRef(dcInstance, inputVars));
}
;

const serverCompleteOutboxEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerCompleteOutboxEvent', inputVars);
}
serverCompleteOutboxEventRef.operationName = 'ServerCompleteOutboxEvent';
exports.serverCompleteOutboxEventRef = serverCompleteOutboxEventRef;

exports.serverCompleteOutboxEvent = function serverCompleteOutboxEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverCompleteOutboxEventRef(dcInstance, inputVars));
}
;

const serverRetryOutboxEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerRetryOutboxEvent', inputVars);
}
serverRetryOutboxEventRef.operationName = 'ServerRetryOutboxEvent';
exports.serverRetryOutboxEventRef = serverRetryOutboxEventRef;

exports.serverRetryOutboxEvent = function serverRetryOutboxEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverRetryOutboxEventRef(dcInstance, inputVars));
}
;

const serverFailOutboxEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerFailOutboxEvent', inputVars);
}
serverFailOutboxEventRef.operationName = 'ServerFailOutboxEvent';
exports.serverFailOutboxEventRef = serverFailOutboxEventRef;

exports.serverFailOutboxEvent = function serverFailOutboxEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverFailOutboxEventRef(dcInstance, inputVars));
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

const transferTableSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'TransferTableSession', inputVars);
}
transferTableSessionRef.operationName = 'TransferTableSession';
exports.transferTableSessionRef = transferTableSessionRef;

exports.transferTableSession = function transferTableSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(transferTableSessionRef(dcInstance, inputVars));
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

const serverQuoteForSubmitRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerQuoteForSubmit', inputVars);
}
serverQuoteForSubmitRef.operationName = 'ServerQuoteForSubmit';
exports.serverQuoteForSubmitRef = serverQuoteForSubmitRef;

exports.serverQuoteForSubmit = function serverQuoteForSubmit(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverQuoteForSubmitRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
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

const serverProductsForOrderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ServerProductsForOrder', inputVars);
}
serverProductsForOrderRef.operationName = 'ServerProductsForOrder';
exports.serverProductsForOrderRef = serverProductsForOrderRef;

exports.serverProductsForOrder = function serverProductsForOrder(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(serverProductsForOrderRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
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

const serverConfirmQuoteRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerConfirmQuote', inputVars);
}
serverConfirmQuoteRef.operationName = 'ServerConfirmQuote';
exports.serverConfirmQuoteRef = serverConfirmQuoteRef;

exports.serverConfirmQuote = function serverConfirmQuote(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverConfirmQuoteRef(dcInstance, inputVars));
}
;

const serverRequestOrderApprovalRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerRequestOrderApproval', inputVars);
}
serverRequestOrderApprovalRef.operationName = 'ServerRequestOrderApproval';
exports.serverRequestOrderApprovalRef = serverRequestOrderApprovalRef;

exports.serverRequestOrderApproval = function serverRequestOrderApproval(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverRequestOrderApprovalRef(dcInstance, inputVars));
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

const serverCloseTableSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerCloseTableSession', inputVars);
}
serverCloseTableSessionRef.operationName = 'ServerCloseTableSession';
exports.serverCloseTableSessionRef = serverCloseTableSessionRef;

exports.serverCloseTableSession = function serverCloseTableSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverCloseTableSessionRef(dcInstance, inputVars));
}
;

const serverCloseSettledTableSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ServerCloseSettledTableSession', inputVars);
}
serverCloseSettledTableSessionRef.operationName = 'ServerCloseSettledTableSession';
exports.serverCloseSettledTableSessionRef = serverCloseSettledTableSessionRef;

exports.serverCloseSettledTableSession = function serverCloseSettledTableSession(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(serverCloseSettledTableSessionRef(dcInstance, inputVars));
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

const tenantProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'TenantProfile', inputVars);
}
tenantProfileRef.operationName = 'TenantProfile';
exports.tenantProfileRef = tenantProfileRef;

exports.tenantProfile = function tenantProfile(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(tenantProfileRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
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
