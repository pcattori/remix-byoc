import { Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return json({});
};

export default function IndexRoute() {
  return (
    <div>
      Go to the{" "}
      <Link className="text-blue-600 underline" to="sales">
        sales
      </Link>{" "}
      page...
    </div>
  );
}
