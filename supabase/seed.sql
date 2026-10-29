-- Senhas e disciplinas são PLACEHOLDERS: troque antes da apresentação.
insert into planets (slug, nome, ordem, senha, cor, ativo) values
 ('guimaraes','Guimarães',1,'LUA1','#7c5cbf',true),
 ('goldwasser','Goldwasser',2,'LUA2','#e8743b',true),
 ('von-neumann','Von Neumann',3,'LUA3','#c9b79c',true),
 ('johnson','Johnson',4,'LUA4','#2aa7a0',false),
 ('wilson','Wilson',5,'LUA5','#8fc3d9',false),
 ('santos','Santos',6,'LUA6','#2d5fa8',false),
 ('west','West',7,'LUA7','#1f4fd6',false),
 ('lamarr','Lamarr',8,'LUA8','#e0452a',false),
 ('hawking','Hawking',9,'LUA9','#e8963a',false);

-- 2 questões de teste por planeta ativo (substituir pelas reais).
do $$
declare p record; q int; i int;
begin
  for p in select id, nome from planets where ativo loop
    for i in 1..2 loop
      insert into questions (planet_id, enunciado, explicacao, posicao)
      values (p.id, 'Questão '||i||' do planeta '||p.nome||' (substituir)', 'Explicação (substituir).', i)
      returning id into q;
      insert into options (question_id, texto, correta) values
        (q,'Alternativa correta',true),(q,'Alternativa B',false),
        (q,'Alternativa C',false),(q,'Alternativa D',false);
    end loop;
  end loop;
end $$;
