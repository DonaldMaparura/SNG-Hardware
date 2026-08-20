package com.sng.one.common;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SequenceService {
    @PersistenceContext
    private EntityManager em;

    @Transactional
    public String next(String name, String prefix, int width) {
        Number current = (Number) em.createNativeQuery("SELECT seq_value FROM sequences WHERE name = :n")
                .setParameter("n", name)
                .getResultStream()
                .findFirst()
                .orElse(null);
        long next;
        if (current == null) {
            next = 1;
            em.createNativeQuery("INSERT INTO sequences (name, seq_value) VALUES (:n, :v)")
                    .setParameter("n", name)
                    .setParameter("v", next)
                    .executeUpdate();
        } else {
            next = current.longValue() + 1;
            em.createNativeQuery("UPDATE sequences SET seq_value = :v WHERE name = :n")
                    .setParameter("v", next)
                    .setParameter("n", name)
                    .executeUpdate();
        }
        return prefix + String.format("%0" + width + "d", next);
    }
}
