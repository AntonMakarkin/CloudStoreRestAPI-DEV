import request from 'supertest';
import app from '../index';
import User from '../models/User';
import tokenUser from '../models/tokens/userToken';
import mongoose from 'mongoose';

const closeConnection = async () => {
    const user = await User.findOne({ email: "vikaShipko1999@mail.ru" });
    await tokenUser.deleteOne({ user: user._id });
    await User.deleteOne({ email: "vikaShipko1999@mail.ru" });
    mongoose.connection.close();
}

afterAll(() => {
    closeConnection();
})

describe("User routes", () => {
    describe("Registrate user", () => {
        describe('Given correct credentials', () => {
            test('Should respond with a 200 status code', async () => {
                const response = await request(app).post('/registration').send({
                    email: "vikaShipko1999@mail.ru",
                    password: "test"
                })
                expect(response.statusCode).toBe(200);
            })
        })
    
        describe('Email already exist', () => {
            test('Should respond with a 400 status code', async () => {
                const response = await request(app).post('/registration').send({
                    email: "vikaShipko1999@mail.ru",
                    password: "test"
                })
                expect(response.statusCode).toBe(400);
            })
        })
    
        describe('Given uncorrect credentials', () => {
            test('Should respond with a 500 status code', async () => {
                const response = await request(app).post('/registration').send({
                    email: "vladimi@mail.ru",
                    password: ""
                })
                expect(response.statusCode).toBe(500);
            })
        })
    });
    
    describe("Login user", () => {
        describe('Given correct credentials', () => {
            test('Should respond with a 200 status code', async () => {
                const response = await request(app).post('/login').send({
                    email: "vikaShipko1999@mail.ru",
                    password: "test"
                })
                expect(response.statusCode).toBe(200);
            })
        });
    
        describe('User does not exist', () => {
            test('Should response with a 404 status code', async () => {
                const response = await request(app).post('/login').send({
                    email: "vika@mail.ru",
                    password: "test"
                })
                expect(response.statusCode).toBe(404)
            })
        });
    
        describe('Incorrect login or password', () => {
            test('Should respond with a 400 status code', async () => {
                const response = await request(app).post('/login').send({
                    email: "vikaShipko1999@mail.ru",
                    password: "test123"
                })
                expect(response.statusCode).toBe(400)
            })
        });
    });
})

