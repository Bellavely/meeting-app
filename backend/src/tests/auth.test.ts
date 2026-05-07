import axios from 'axios';
import { runMigrations } from '../db/init-db';

const API_URL = 'http://localhost:5000';

async function testAuth() {
    console.log('--- Starting Auth Tests ---');
    
    try {
        // 1. Ensure DB is ready
        console.log('Ensuring database is ready...');
        await runMigrations();

        const testUser = {
            firstName: 'Test',
            lastName: 'User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        };

        // 2. Test Registration
        console.log('Testing Registration...');
        const regResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('Registration Response:', regResponse.status, regResponse.data.message);

        if (regResponse.status !== 210 && regResponse.status !== 201) {
            throw new Error(`Registration failed with status ${regResponse.status}`);
        }

        // 3. Test Login
        console.log('Testing Login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login Response:', loginResponse.status, loginResponse.data.message);

        if (loginResponse.status !== 200) {
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }

        if (!loginResponse.data.token) {
            throw new Error('Login response did not include a token');
        }

        console.log('--- Auth Tests Passed Successfully! ---');
    } catch (error: any) {
        console.error('--- Auth Tests Failed! ---');
        if (error.response) {
            console.error('Error Data:', error.response.data);
            console.error('Error Status:', error.response.status);
        } else {
            console.error('Error Message:', error.message);
        }
        process.exit(1);
    }
}

// Note: This test assumes the server is running.
// We will start the server in the background and then run this test.
testAuth();
