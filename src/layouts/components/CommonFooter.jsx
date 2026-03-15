import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  company: ["About Us", "Professionals", "Terms Of Use", "Privacy Policy", "Refund Policy", "Career"],
  help: ["Contact Us", "My Bookings", "Reviews", "Stories", "Raise Complaint"],
  explore: ["All Services", "Join ONDC", "Blogs"],
};

const FOOTER_LINK_PATHS = {
  "About Us": "/about-us",
  Professionals: "/professionals",
  "Terms Of Use": "/terms-of-use",
  "Privacy Policy": "/privacy-policy",
  "Refund Policy": "/refund-policy",
  Career: "/career",
  "Contact Us": "/contact-us",
  "My Bookings": "/customer/bookings",
  Reviews: "/reviews",
  Stories: "/stories",
  "All Services": "/customer/home",
  "Raise Complaint": "/complaints",
};

const AVAILABLE_CITIES = [
  "Mancherial",
  "Hyderabad",
  "Warangal",
  "Karimnagar",
  "Nizamabad",
  "Khammam",
  "Nalgonda",
  "Adilabad",
];

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>
            {FOOTER_LINK_PATHS[item] ? (
              <Link to={FOOTER_LINK_PATHS[item]} className="hover:text-primary hover:underline">
                {item}
              </Link>
            ) : (
              <span>{item}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CommonFooter() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-7xl rounded-2xl border bg-slate-100 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-2xl font-semibold text-indigo-700">ServiceConnect</h3>
          <p className="mt-3 text-sm text-slate-600">
            Local services platform for Mancherial and nearby cities.
          </p>
        </div>

        <FooterColumn title="ServiceConnect" items={FOOTER_LINKS.company} />
        <FooterColumn title="Need Help?" items={FOOTER_LINKS.help} />
        <FooterColumn title="Explore More" items={FOOTER_LINKS.explore} />
      </div>

      <div className="mt-6 border-t border-slate-300 pt-5 text-sm text-slate-600">
        <p>
          <strong>We are available in:</strong> {AVAILABLE_CITIES.join(", ")}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 ServiceConnect Online Services Pvt Ltd. All rights reserved.</p>
          <p>Made with care in India</p>
        </div>
      </div>
    </footer>
  );
}

