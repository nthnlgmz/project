import OrdersView from './OrdersView';

export const metadata = { title: "My orders | Fundy's", robots: { index: false, follow: false } };

export default function MyOrdersPage() {
  return (
    <main id="main" className="legal">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Your account</p>
          <h1 className="co-title">My orders</h1>
        </header>
        <OrdersView />
      </div>
    </main>
  );
}
