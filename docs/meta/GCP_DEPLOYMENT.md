# Deploying Language Reactor to Google Cloud Run with Turso

This guide explains how to deploy the Language Reactor project to Google Cloud Run using Docker and Turso (Persistent SQLite).

## Step 1: Set up the Persistent Database (Turso)

Since Cloud Run is stateless, we use Turso to keep your comments permanently.

1. **Sign up**: Go to [turso.tech](https://turso.tech/) and sign up.
2. **Install Turso CLI** (Optional but recommended):

    ```bash
    curl -sSfL https://get.turso.tech/install.sh | sh
    ```

3. **Create a database**:

    ```bash
    turso db create language-reactor
    ```

4. **Get connection details**:
    * **Database URL**: `turso db show language-reactor --url` (e.g., `libsql://your-db.turso.io`)
    * **Auth Token**: `turso db tokens create language-reactor`

---

## Step 2: Deploy to Google Cloud Run

Run the following command in the root of the project. Replace the placeholders with your actual Turso credentials.

```bash
gcloud run deploy language-reactor \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --set-env-vars="TURSO_DATABASE_URL=your_turso_url,TURSO_AUTH_TOKEN=your_turso_token"
```

### Why these settings?

* **--memory 2Gi**: Compilation (especially Rust/C++) requires significant memory.
* **--allow-unauthenticated**: Makes your website public.
* **--set-env-vars**: This connects your app to the Turso database.

---

## Step 3: Access Your App

Once the command finishes, it will provide a URL like:
`https://language-reactor-xxxxx.a.run.app`

Open this in your browser!

---

## Step 4: Automate Deployment (CI/CD)

To avoid running the deploy command manually every time, you can use GitHub Actions:

1. **Create a Service Account**: In Google Cloud Console, create a Service Account with "Cloud Run Admin" and "Service Account User" roles.
2. **Generate Key**: Create and download a JSON key for that service account.
3. **Add GitHub Secrets**:
    * Go to your repository on GitHub.
    * Click on **Settings** (top tab).
    * On the left sidebar, click **Secrets and variables** > **Actions**.
    * Click the green **New repository secret** button for each of these:
        * `GCP_PROJECT_ID`: Your Google Cloud Project ID.
        * `GCP_SA_KEY`: The entire content of your downloaded JSON key file.
        * `TURSO_DATABASE_URL`: Your Turso database URL (starts with `libsql://`).
        * `TURSO_AUTH_TOKEN`: Your Turso auth token.
4. **Push Code**: Every time you push to the `main` branch, GitHub will automatically redeploy your site.

## Local Testing with Turso

To test locally using your Turso database:

```bash
export TURSO_DATABASE_URL="your_turso_url"
export TURSO_AUTH_TOKEN="your_turso_token"
npm start
```
