/**
 * LETCON - VerifiedAccountBanner Component
 * Highly visible warning banner on every earner dashboard page.
 * Dismissible for the current session only - reappears on every login.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
