import React, { useEffect, useState } from "react";
import Head from "next/head";
import api from "../api/api";
import { Person } from "../types";
import { AdminGate } from "../components/Admin/AdminGate";
import classes from "../styles/AdminPage.module.css";

interface Payment {
  id: number;
  mollie_id: string;
  person_id: number;
  amount: number;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [users, setUsers] = useState<Person[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab, setTab] = useState<"users" | "payments">("users");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuth) {
      return;
    }
    api.get<Person[]>("/users").then((r) => setUsers(r.data));
    api.get<Payment[]>("/payments").then((r) => setPayments(r.data));
  }, [isAuth]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?display=swap&family=Epilogue:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900"
        />
      </Head>
      <AdminGate onAuthenticated={() => setIsAuth(true)}>
        <div className={classes.root}>
          <aside className={classes.sidebar}>
            <h1 className={classes.logo}>DrinkTracker</h1>
            <nav className={classes.nav}>
              <span className={classes.menuItem}>Home</span>
              <span className={classes.menuItem}>Drinks</span>
              <span className={classes.menuItem}>Users</span>
              <span className={classes.menuItem}>Payments</span>
              <span className={`${classes.menuItem} ${classes.menuItemActive}`}>
                Settings
              </span>
            </nav>
          </aside>
          <main className={classes.content}>
            <header className={classes.header}>
              <p className={classes.title}>Settings</p>
            </header>
            <div className={classes.tabs} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "users"}
                className={`${classes.tab} ${tab === "users" ? classes.tabActive : ""}`}
                onClick={() => setTab("users")}
              >
                Users
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "payments"}
                className={`${classes.tab} ${tab === "payments" ? classes.tabActive : ""}`}
                onClick={() => setTab("payments")}
              >
                Payments
              </button>
            </div>

            {tab === "users" && (
              <>
                <h2 className={classes.sectionHeading}>Manage Users</h2>
                <div className={classes.searchArea}>
                  <label className={classes.searchLabel}>
                    <input
                      className={classes.searchInput}
                      placeholder="Search users"
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                    />
                  </label>
                </div>
                <div className={classes.tableContainer}>
                  <div className={classes.tableWrapper}>
                    <table className={classes.table}>
                      <thead>
                        <tr>
                          <th className={classes.colName}>Name</th>
                          <th className={classes.colEmail}>Email</th>
                          <th className={classes.colBalance}>Balance</th>
                          <th className={classes.colActions}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className={classes.colName}>{u.name}</td>
                            <td className={classes.colEmail}>-</td>
                            <td className={classes.colBalance}>${u.balance}</td>
                            <td
                              className={`${classes.colActions} ${classes.actionCell}`}
                            >
                              Edit
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={classes.addUser}>
                  <button type="button" className={classes.addUserButton}>
                    Add User
                  </button>
                </div>
              </>
            )}

            {tab === "payments" && (
              <>
                <h2 className={classes.sectionHeading}>Payments</h2>
                <div className={classes.tableContainer}>
                  <div className={classes.tableWrapper}>
                    <table className={classes.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User ID</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.person_id}</td>
                            <td>{p.amount}</td>
                            <td>{p.status}</td>
                            <td>
                              {p.created_at
                                ? new Date(p.created_at).toLocaleDateString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </AdminGate>
    </>
  );
}
