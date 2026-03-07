import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAthletes } from '../api/api'
import Navbar from '../components/Navbar'
import './AthletesPage.css'

function nextSort(current) {
  if (current === null) return 'ASC';
  if (current === 'ASC') return 'DESC';
  return null;
}

function SortIcon({ dir }) {
  if (dir === 'ASC') return <span className="sort-icon">↑</span>;
  if (dir === 'DESC') return <span className="sort-icon">↓</span>;
  return <span className="sort-icon sort-icon--inactive">↕</span>;
}