import React, { useState } from 'react';
import {
  Server,
  Database,
  ArrowDownUp,
  FileCode,
  Copy,
  Check,
  Play,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';

export const SpringBootHub: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'ARCHITECTURE' | 'ENDPOINTS' | 'JAVA_CODE' | 'SCHEMA' | 'DEPLOY'>('ARCHITECTURE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [callingEndpoint, setCallingEndpoint] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const testEndpoint = async (endpoint: string) => {
    setCallingEndpoint(endpoint);
    try {
      let res: any;
      if (endpoint === '/api/dashboard/summary') {
        res = await api.getDashboardSummary();
      } else if (endpoint === '/api/expenses') {
        res = await api.getExpenses();
      } else if (endpoint === '/api/income') {
        res = await api.getIncome();
      } else if (endpoint === '/api/categories') {
        res = await api.getCategories();
      } else if (endpoint === '/api/budgets') {
        res = await api.getBudgets();
      } else {
        res = { status: 'OK', message: 'Endpoint active', timestamp: new Date().toISOString() };
      }
      setApiResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setApiResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setCallingEndpoint(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-400" />
            <span>Java Spring Boot & MySQL Full-Stack Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise 3-tier architecture with React Frontend, Spring Boot REST controllers, Spring Data JPA repositories, and MySQL relational schema.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'ARCHITECTURE', label: 'Architecture' },
            { id: 'ENDPOINTS', label: 'REST APIs' },
            { id: 'JAVA_CODE', label: 'Spring Boot Code' },
            { id: 'SCHEMA', label: 'MySQL Schema' },
            { id: 'DEPLOY', label: 'Single JAR Deploy' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTab(t.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                selectedTab === t.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE DIAGRAM (Matches user's image exactly) */}
      {selectedTab === 'ARCHITECTURE' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-8">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white tracking-wide">1. Project Architecture</h3>
              <p className="text-xs text-slate-400">High-Performance Full-Stack 3-Tier Enterprise Design</p>
            </div>

            {/* Tier 1: Frontend */}
            <div className="max-w-2xl mx-auto p-5 rounded-xl bg-slate-950/90 border border-purple-800/40 text-center space-y-2 shadow-lg hover:border-purple-600 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">Frontend — React</h4>
              <p className="text-xs text-slate-400">
                Dashboard · Expenses · Income · Budgets · Categories · Reports · Login
              </p>
              <div className="text-[11px] text-purple-300 font-mono">
                Vite · Tailwind CSS · Recharts · ₹ INR Formatting · Asia/Kolkata
              </div>
            </div>

            {/* Arrow with HTTP requests */}
            <div className="flex flex-col items-center justify-center gap-1 text-slate-400 text-xs">
              <ArrowDownUp className="w-5 h-5 text-purple-400" />
              <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                HTTP requests to /api/* (JSON REST APIs)
              </span>
            </div>

            {/* Tier 2: Backend Spring Boot */}
            <div className="max-w-2xl mx-auto p-5 rounded-xl bg-slate-950/90 border border-indigo-800/40 text-center space-y-2 shadow-lg hover:border-indigo-600 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">Backend — Java Spring Boot</h4>
              <p className="text-xs text-slate-400">
                Controllers · Services · Repositories · Spring Security · JWT Filter · CORS
              </p>
              <div className="text-[11px] text-indigo-300 font-mono">
                Spring Boot 3.2+ · Spring Data JPA · Hibernate ORM · BigDecimal Currency
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center justify-center gap-1 text-slate-400 text-xs">
              <ArrowDownUp className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                JPA / Hibernate SQL Queries & Transactions
              </span>
            </div>

            {/* Tier 3: MySQL Database */}
            <div className="max-w-2xl mx-auto p-5 rounded-xl bg-slate-950/90 border border-emerald-800/40 text-center space-y-2 shadow-lg hover:border-emerald-600 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-wide">MySQL Database</h4>
              <p className="text-xs text-slate-400">
                Users · Expenses · Income · Categories · Budgets · Savings Goals
              </p>
              <div className="text-[11px] text-emerald-300 font-mono">
                DECIMAL(12,2) Currency · Indexed Foreign Keys · UTC Timestamps
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE REST ENDPOINTS EXPLORER */}
      {selectedTab === 'ENDPOINTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Live Spring Boot REST Endpoints</h3>
              <p className="text-xs text-slate-400">
                Click &quot;Send Request&quot; on any endpoint to execute and inspect the live JSON payload.
              </p>

              <div className="space-y-2">
                {[
                  { method: 'GET', path: '/api/dashboard/summary', desc: 'Financial summary (balance, monthly income/outflows, trends)' },
                  { method: 'GET', path: '/api/expenses', desc: 'Get all user expenses with category mapping' },
                  { method: 'GET', path: '/api/income', desc: 'Get all user income transactions' },
                  { method: 'GET', path: '/api/categories', desc: 'Get all Indian default & custom categories' },
                  { method: 'GET', path: '/api/budgets', desc: 'Get active monthly & category budgets with spending progress' },
                ].map(ep => (
                  <div
                    key={ep.path}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          {ep.method}
                        </span>
                        <span className="font-mono text-purple-300 font-medium">{ep.path}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">{ep.desc}</span>
                    </div>

                    <button
                      onClick={() => testEndpoint(ep.path)}
                      disabled={callingEndpoint === ep.path}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-sm transition-colors whitespace-nowrap ml-3"
                    >
                      <Play className="w-3 h-3" />
                      <span>{callingEndpoint === ep.path ? 'Calling...' : 'Send Request'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Response Panel */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col h-[420px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-mono text-slate-400">Response Payload (JSON)</span>
                {apiResult && (
                  <button
                    onClick={() => copyToClipboard('apiResult', apiResult)}
                    className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                  >
                    {copiedKey === 'apiResult' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'apiResult' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto pt-3">
                {apiResult ? (
                  <pre className="font-mono text-[11px] text-purple-300 whitespace-pre-wrap">
                    {apiResult}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Click &quot;Send Request&quot; on any endpoint to inspect response.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE JAVA SOURCE CODE */}
      {selectedTab === 'JAVA_CODE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Complete Java Spring Boot source code created in <code className="text-purple-300">backend/src/main/java/com/expensetracker/</code>
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-mono text-purple-400 font-semibold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  ExpenseController.java
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'expCtrl',
                      `package com.expensetracker.controller;

import com.expensetracker.entity.Expense;
import com.expensetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getUserExpenses());
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.createExpense(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}`
                    )
                  }
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                >
                  {copiedKey === 'expCtrl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'expCtrl' ? 'Copied' : 'Copy Java'}</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2">
{`package com.expensetracker.controller;

import com.expensetracker.entity.Expense;
import com.expensetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getUserExpenses());
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.createExpense(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MYSQL SCHEMA */}
      {selectedTab === 'SCHEMA' && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              database/schema.sql
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  'schema',
                  `-- RupeeTrack India Expense Tracker MySQL Schema
CREATE DATABASE IF NOT EXISTS expense_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expense_tracker_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('EXPENSE', 'INCOME') NOT NULL DEFAULT 'EXPENSE',
    icon VARCHAR(50) DEFAULT 'Tags',
    color VARCHAR(20) DEFAULT '#8b5cf6',
    is_custom BOOLEAN DEFAULT FALSE,
    user_id BIGINT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id BIGINT NOT NULL,
    payment_method ENUM('UPI', 'CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER') NOT NULL DEFAULT 'UPI',
    expense_date DATE NOT NULL,
    notes TEXT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, expense_date)
);`
                )
              }
              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
            >
              {copiedKey === 'schema' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'schema' ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2">
{`-- RupeeTrack India Expense Tracker MySQL Schema
CREATE DATABASE IF NOT EXISTS expense_tracker_db;
USE expense_tracker_db;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id BIGINT NOT NULL,
    payment_method ENUM('UPI', 'CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER') NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </div>
      )}

      {/* TAB 5: SINGLE JAR DEPLOYMENT */}
      {selectedTab === 'DEPLOY' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-semibold text-white">Single-Link JAR Production Deployment</h3>
          <p>
            To deploy both the React frontend and Spring Boot backend as one single executable JAR on a single domain/port:
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Build Frontend:</strong> Run <code className="text-purple-300 font-mono">npm run build</code> to produce static assets in <code className="text-purple-300 font-mono">dist/</code>.
            </li>
            <li>
              <strong>Copy Assets to Spring Boot:</strong> Copy files from <code className="text-purple-300 font-mono">dist/*</code> into Spring Boot's <code className="text-purple-300 font-mono">backend/src/main/resources/static/</code>.
            </li>
            <li>
              <strong>Package Executable JAR:</strong> Run <code className="text-purple-300 font-mono">mvn clean package</code> inside <code className="text-purple-300 font-mono">backend/</code>.
            </li>
            <li>
              <strong>Execute JAR:</strong> Run <code className="text-purple-300 font-mono">java -jar target/expense-tracker-0.0.1-SNAPSHOT.jar</code>.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
