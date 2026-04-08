// Maps route paths to their lazy import functions.
// When a user hovers a link, we fire the matching import()
// so the chunk is already cached when they click.

const routeImports = {
  "/dashboard/users": {
    list: () => import("../features/users/UsersList"),
    add: () => import("../features/users/AddUserForm"),
    edit: () => import("../features/users/EditUserForm"),
  },
  "/dashboard/incomings": {
    list: () => import("../features/incomings/IncomingsList"),
    add: () => import("../features/incomings/AddIncomingForm"),
    edit: () => import("../features/incomings/EditIncomingForm"),
  },
  "/dashboard/outgoings": {
    list: () => import("../features/outgoings/OutgoingsList"),
    add: () => import("../features/outgoings/AddOutgoingForm"),
    edit: () => import("../features/outgoings/EditOutgoingForm"),
  },
  "/dashboard/deathcases": {
    list: () => import("../features/deathCases/DeathCasesList"),
    add: () => import("../features/deathCases/AddDeathCaseForm"),
    edit: () => import("../features/deathCases/EditDeathCaseForm"),
  },
  "/dashboard/prisoncases": {
    list: () => import("../features/prisonCases/prisonCasesList"),
    add: () => import("../features/prisonCases/AddPrisonCaseForm"),
    edit: () => import("../features/prisonCases/EditPrisonCaseForm"),
  },
  "/dashboard/assets": {
    list: () => import("../features/assets/AssetsList"),
    add: () => import("../features/assets/AddAssetForm"),
    edit: () => import("../features/assets/EditAssetForm"),
  },
  "/dashboard/purchaseorders": {
    list: () => import("../features/purchaseOrders/PurchaseOrdersList"),
    add: () => import("../features/purchaseOrders/AddPurchaseOrderForm"),
    edit: () => import("../features/purchaseOrders/EditPurchaseOrderForm"),
  },
  "/dashboard/collectionorders": {
    list: () => import("../features/collectionOrders/CollectionOrdersList"),
    add: () => import("../features/collectionOrders/AddCollectionOrderForm"),
    edit: () => import("../features/collectionOrders/EditCollectionOrderForm"),
  },
  "/dashboard/banks": {
    list: () => import("../features/banks/BanksList"),
    add: () => import("../features/banks/AddBankForm"),
    edit: () => import("../features/banks/EditBankForm"),
  },
  "/dashboard/logs": {
    list: () => import("../features/logger/LogsList"),
  },
  "/dashboard": {
    list: () => import("../features/auth/Home"),
  },
};

/**
 * Returns an object with onMouseEnter and onFocus handlers
 * that prefetch the chunk for the given route path.
 */
export function prefetchHandlers(to) {
  let fired = false;

  const trigger = () => {
    if (fired) return;
    fired = true;

    // Exact match for add/edit sub-routes
    for (const [base, imports] of Object.entries(routeImports)) {
      if (to === base || to === base + "/") {
        imports.list?.();
        return;
      }
      if (to === base + "/add" || to.startsWith(base + "/add")) {
        imports.add?.();
        return;
      }
      if (to.startsWith(base + "/edit")) {
        imports.edit?.();
        return;
      }
    }
  };

  return { onMouseEnter: trigger, onFocus: trigger };
}

/**
 * Prefetch all chunks for a given base route (list + add + edit).
 * Used by the sidebar to preload everything for a section on hover.
 */
export function prefetchAllHandlers(to) {
  let fired = false;

  const trigger = () => {
    if (fired) return;
    fired = true;

    const imports = routeImports[to];
    if (imports) {
      imports.list?.();
      imports.add?.();
      imports.edit?.();
    }
  };

  return { onMouseEnter: trigger, onFocus: trigger };
}
