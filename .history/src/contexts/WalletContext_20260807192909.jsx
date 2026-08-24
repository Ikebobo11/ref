/**
 * LETCON - Wallet Context
 * Manages wallet state, balance, and transaction history for the current user.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
