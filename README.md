<h1 align="center">🥤 DrinkTracker</h1>

<p align="center">
  <b>A simple and professional drink balance tracker for teams</b><br />
  Track drink consumption, manage balances, and view insightful statistics.
</p>

<hr/>

<h2>🚀 Features</h2>

<ul>
  <li><b>User Cards:</b> Easily add drinks or top up a user’s balance with one click.</li>
  <li><b>Undo Actions:</b> Added a drink by mistake? Instantly undo it.</li>
  <li><b>Admin Panel:</b> Password-protected access to manage users, update balances, and view payment history.</li>
  <li><b>Statistics Page:</b> Clean dashboards for monthly/yearly drink stats and user leaderboards.</li>
  <li><b>Responsive Design:</b> Optimized for desktop and mobile use.</li>
</ul>

<h2>📸 UI Preview</h2>

<p align="center">
  <img src="images/preview.png" alt="App Screenshot" width="600" />
</p>

<hr/>

<h2>📦 Tech Stack</h2>

<table>
  <tr>
    <td><b>Frontend</b></td>
    <td>React, Next.js, Mantine UI, Tabler Icons</td>
  </tr>
  <tr>
    <td><b>Backend</b></td>
    <td>FastAPI (Python), SQLAlchemy, PostgreSQL</td>
  </tr>
  <tr>
    <td><b>Other</b></td>
    <td>Docker, REST API, Pydantic</td>
  </tr>
</table>

<hr/>

<h2>🔧 Getting Started</h2>

<pre>
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Start the backend (FastAPI)
uvicorn app.main:app --reload

# Install frontend dependencies
cd ../frontend
npm install

# Start the frontend
npm run dev
</pre>

<hr/>

<h2>🔐 Admin Access</h2>

To access the admin panel, enter the password defined in your `.env.local`:

```env
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```
Replace `your_secure_password` with a strong secret.

<h2>🗄 Database Backup</h2>

A helper script <code>scripts/backup_db.sh</code> is available to dump the PostgreSQL
 database and upload the archive to Google Drive or OneDrive using
<a href="https://rclone.org">rclone</a>. The script keeps only the two most recent
backups on the remote storage.

Usage example:

```bash
# Configure rclone with a remote named "gdrive" or "onedrive"
./scripts/backup_db.sh gdrive DrinkTrackerBackups
```

To run the backup every day at 2 AM via cron:

```cron
0 2 * * * /path/to/DrinkTracker/scripts/backup_db.sh gdrive DrinkTrackerBackups
```

You can automate the setup using `scripts/install_backup_cron.sh`, which
creates a daily cron entry. The following command installs a job that runs at
2 AM every day:

```bash
./scripts/install_backup_cron.sh gdrive DrinkTrackerBackups 2
```
