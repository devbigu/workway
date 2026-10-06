import { AddressManager } from "@/features/account/components/address-manager";
import { requireCustomerPage } from "@/features/account/server/account.service";
import { listSavedAddresses } from "@/features/checkout/server/address.service";

export default async function AddressesPage() {
  const customer = await requireCustomerPage();
  const addresses = await listSavedAddresses(customer.id);
  return <AddressManager initial={addresses} />;
}
