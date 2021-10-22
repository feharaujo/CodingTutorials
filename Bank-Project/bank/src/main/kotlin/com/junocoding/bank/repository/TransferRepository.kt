package com.junocoding.bank.repository

import org.springframework.data.repository.CrudRepository
import java.util.*

interface TransferRepository: CrudRepository<TransactionDBModel, UUID>
